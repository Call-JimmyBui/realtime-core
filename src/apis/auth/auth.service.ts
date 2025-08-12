import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import * as crypto from 'crypto';
import { Model, Types } from 'mongoose';
import * as ms from 'ms';

import { IEmailJob, IVerifyEmailJob } from '@/common/interface/job.interface';
import { Branded } from '@/common/type/common-type';
import { AllConfigType } from '@/config/config.type';
import { SYSTEM_USER_ID } from '@/constants/app.constant';
import { CacheKey } from '@/constants/cache.constant';
import { AuthProviderType, ROLE } from '@/constants/entity-enum.constant';
import { JobName, QueueName } from '@/constants/job.constant';
import { RedisService } from '@/redis/redis.service';
import { createCacheKey } from '@/utils/cache-key';
import { verifyPassword } from '@/utils/password.util';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { User, UserDocument } from '../user/schemas/user.schema';
import { LoginReqDto } from './dtos/login.req.dto';
import { LoginResDto } from './dtos/login.res.dto';
import { RefreshReqDto } from './dtos/refresh.req.dto';
import { RefreshResDto } from './dtos/refresh.res.dto';
import { RegisterReqDto } from './dtos/register.req.dto';
import { RegisterResDto } from './dtos/register.res.dto';
import { AuthProvider, AuthProviderDocument } from './schemas/auth-provider.schema';
import { Role, RoleDocument } from './schemas/role.schema';
import { Session, SessionDocument } from './schemas/session.schema';
import { JwtPayloadType } from './types/jwt-payload.type';
import { JwtRefreshPayloadType } from './types/jwt-refresh-payload.type';


type Token = Branded<{
  accessToken: string;
  refreshToken: string;
  tokenExpires: number;
}, 'token'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
    @InjectModel(AuthProvider.name)
    private readonly authProviderModel: Model<AuthProviderDocument>,
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
    @InjectQueue(QueueName.EMAIL)
    private readonly emailQueue: Queue<IEmailJob, any, string>,
  ) {}

  async signIn(dto: LoginReqDto): Promise<LoginResDto> {
    const { email, password } = dto;

    const account = await this.authProviderModel.findOne({
      email,
      providerType: AuthProviderType.EMAIL_PASSWORD,
    }).lean<AuthProviderDocument>();
console.log('/////////', account);

    if (
        !account ||
        !account.password ||
        !(await verifyPassword(password, account.password))
      ) {
      throw new UnauthorizedException('Sai email hoặc mật khẩu.');
    }

    return this.returnTokenAfterLoginSuccess(account._id);
  }

  async register(dto: RegisterReqDto): Promise<RegisterResDto> {
    const registered = await this.redisService.get(dto.email);
    
    if (registered === 'register') {
      throw new BadRequestException('Yêu cầu đăng ký đã được gửi. Vui lòng kiểm tra email của bạn.');
    }

    let account = await this.authProviderModel.findOne({
      email: dto.email,
      providerType: AuthProviderType.EMAIL_PASSWORD,
    });

    let user: any

    if (account) {
      user = await this.userModel.findOne({ authProviderId: account._id }).orFail(
        () => new UnauthorizedException('Tài khoản không tồn tại.')
      );

      if (user.isVerify) {
        throw new UnauthorizedException('Email đã được đăng ký và xác minh.');
      }

      account.password = dto.password;
      await account.save();
    } else {
      const userRole = await this.roleModel.findOne({ rolename: ROLE.USER }).orFail(
        () => new BadRequestException('Vai trò người dùng không tồn tại.')
      );

      account = await this.authProviderModel.create({
        email: dto.email,
        providerType: AuthProviderType.EMAIL_PASSWORD,
        password: dto.password,
        createdBy: SYSTEM_USER_ID,
        updatedBy: SYSTEM_USER_ID,
      });

      user = await this.userModel.create({
        authProviderId: account._id,
        email: dto.email,
        roles: [userRole._id],
        createdBy: SYSTEM_USER_ID,
        updatedBy: SYSTEM_USER_ID,
      }); 

      await user.save(user);
    }

    const token = await this.createVerificationToken({ id: user.id });
    const tokenExpiresIn = this.configService.getOrThrow(
      'auth.confirmEmailExpires',
      { infer: true },
    );
    await this.redisService.set(
      createCacheKey(CacheKey.EMAIL_VERIFICATION, user.id),
      token,
      ms(tokenExpiresIn),
    );

    await this.redisService.set(dto.email, 'register', 60000);

    await this.emailQueue.add(
      JobName.EMAIL_VERIFICATION,
      {
        email: dto.email,
        token,
      } as IVerifyEmailJob,
    );

    return plainToInstance(RegisterResDto, {
      accountId: account.id,
    });
  }

  async logout(userToken: JwtPayloadType): Promise<void> {

    //thời gian còn lại cho đến khi token hết hạn
    const ttlInSeconds = Math.max(0, Math.floor((userToken.exp * 1000 - Date.now()) / 1000));

    await this.redisService.set(
      createCacheKey(CacheKey.SESSION_BLACKLIST, userToken.sessionId),
      'true',
      ttlInSeconds,
    );

    await this.sessionModel.deleteOne({ _id: userToken.sessionId });
  }


  async verifyEmail(token: string): Promise<any> {
    const { id } = await this.verifyEmailToken(token);

    const tokenCache = await this.redisService.get(
      createCacheKey(CacheKey.EMAIL_VERIFICATION, id),
    );

    if (token !== tokenCache) {
      throw new UnauthorizedException();
    }

    try {
      const user = await this.userModel.findOne({ _id: id }).orFail();
      
      user.isVerify = true;
      await user.save();
      
      return { message: 'Xác minh email thành công.' };

    } catch (error) {
      throw new UnauthorizedException('Người dùng không tồn tại.');
    }
  }

  async refreshToken(dto: RefreshReqDto): Promise<RefreshResDto> {
    const { sessionId, hash } = this.verifyRefreshToken(dto.refreshToken);

    const session = await this.sessionModel.findById(sessionId).lean<SessionDocument>();
    if (!session || session.hash !== hash) {
      throw new UnauthorizedException('Refresh token không hợp lệ.');
    }

    const user = await this.userModel.findById(session.user).lean<UserDocument>();
    if (!user || !user.roles || user.roles.length === 0) {
      throw new UnauthorizedException('Người dùng không tồn tại hoặc không có quyền.');
    }

    const roleDocs = await this.roleModel.find({ _id: { $in: user.roles } }).lean<RoleDocument[]>();

    const newHash = crypto.createHash('sha256').update(randomStringGenerator()).digest('hex');

    await this.sessionModel.updateOne({ _id: sessionId }, { $set: { hash: newHash } });

    return this.createToken({
      id: user._id.toString(),
      roles: roleDocs.map(r => r.rolename as string),
      sessionId: sessionId.toString(),
      hash: newHash,
    });
  }

  async verifyAccessToken(token: string): Promise<JwtPayloadType> {
    if (!token) {
      throw new UnauthorizedException('Token không được cung cấp.');
    }

    let payload: JwtPayloadType;
    try {
      payload = this.jwtService.verify<JwtPayloadType>(token.trim(), {
        secret: this.configService.getOrThrow('auth.secret', { infer: true }),
      });
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ.');
    }

    const isBlacklisted = await this.redisService.get(
      createCacheKey(CacheKey.SESSION_BLACKLIST, payload.sessionId)
    );

    if (isBlacklisted === 'true') {
      throw new UnauthorizedException('Phiên đã bị đăng xuất.');
    }

    return payload;
  }

  private async returnTokenAfterLoginSuccess(providerId: Types.ObjectId): Promise<LoginResDto> {
    const user = await this.userModel
      .findOne({ authProviderId: providerId })
      .populate<{ roles: RoleDocument[] }>('roles');

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại.');
    }
    if (!user.isActive || !user.isVerify) {
      throw new UnauthorizedException('Tài khoản bị khóa hoặc chưa được xác minh.');
    }
    if (!user.roles || user.roles.length === 0) {
      throw new UnauthorizedException('Tài khoản không có vai trò hợp lệ.');
    }

    const hash = crypto.createHash('sha256').update(randomStringGenerator()).digest('hex');

    const session = await this.sessionModel.create({
      hash,
      user: user._id,
      createdBy: SYSTEM_USER_ID,
      updatedBy: SYSTEM_USER_ID,
    });

    const token = await this.createToken({
      id: user._id.toString(),
      roles: user.roles.map(r => r.rolename),
      sessionId: session._id.toString(),
      hash,
    });

    return plainToInstance(LoginResDto, {
      userId: user._id,
      ...token,
    });
  }

  private verifyRefreshToken(token: string): JwtRefreshPayloadType {
    try {
      return this.jwtService.verify<JwtRefreshPayloadType>(token, {
        secret: this.configService.getOrThrow('auth.refreshSecret', { infer: true }),
      });
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ.');
    }
  }

  private async verifyEmailToken(token: string): Promise<JwtPayloadType> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
      });
    } catch {
      throw new UnauthorizedException();
    }
  }

  private async createToken(data: {
    id: string;
    roles: string[];
    sessionId: string;
    hash: string;
  }): Promise<Token> {

    const expiresIn = this.configService.getOrThrow('auth.expires', { infer: true });
    const tokenExpires = Date.now() + ms(expiresIn);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { id: data.id, roles: data.roles, sessionId: data.sessionId },
        { secret: this.configService.getOrThrow('auth.secret', { infer: true }), expiresIn }
      ),
      this.jwtService.signAsync(
        { sessionId: data.sessionId, hash: data.hash },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', { infer: true }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', { infer: true }),
        }
      ),
    ]);

    return { accessToken, refreshToken, tokenExpires } as Token;
  }


  private async createVerificationToken(data: { id: string }): Promise<string> {
    
    return await this.jwtService.signAsync(
      {
        id: data.id,
      },
      {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
        expiresIn: this.configService.getOrThrow('auth.confirmEmailExpires', {
          infer: true,
        }),
      },
    );
  }
}
