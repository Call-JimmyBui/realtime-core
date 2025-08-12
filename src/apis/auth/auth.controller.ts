import { CurrentUser } from '@/decorators/current-user.decorator';
import { ApiAuth, ApiPublic } from '@/decorators/http.decorator';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginReqDto } from './dtos/login.req.dto';
import { LoginResDto } from './dtos/login.res.dto';
import { RefreshReqDto } from './dtos/refresh.req.dto';
import { RefreshResDto } from './dtos/refresh.res.dto';
import { RegisterReqDto } from './dtos/register.req.dto';
import { RegisterResDto } from './dtos/register.res.dto';
import { JwtPayloadType } from './types/jwt-payload.type';

@ApiTags('auth')
@Controller({
  path: 'auth',
  version:'1'
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiPublic({
    type: LoginResDto,
    summary: 'Đăng nhập',
  })
  @Post('login')
  async signIn(@Body() userLogin: LoginReqDto): Promise<LoginResDto> {
    return await this.authService.signIn(userLogin);
  }

  @ApiPublic({
    type: RefreshResDto,
    summary: 'Đăng ký'
  })
  @Post('register')
  async register(@Body() dto: RegisterReqDto): Promise<RegisterResDto> {    
    return await this.authService.register(dto);
  }

  @ApiAuth({
    summary: 'Đăng xuất',
  })
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@CurrentUser() userToken: JwtPayloadType): Promise<void> {
    await this.authService.logout(userToken);
  }

  @ApiAuth({
    type: RefreshResDto,
    summary: 'Refresh token',
  })
  @Post('refresh')
  async refresh(@Body() dto: RefreshReqDto): Promise<RefreshResDto> {
    return await this.authService.refreshToken(dto);
  }

  @ApiPublic()
  @Get('verify/email')
  async verifyEmail(@Query() query) {
    return this.authService.verifyEmail(query.token);
  }
}