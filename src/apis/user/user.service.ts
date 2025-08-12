import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { plainToInstance } from 'class-transformer';
import { UserResDto } from './dto/user.res.dto';
import { OffsetPaginatedDto } from '@/common/dto/offset-pagination.ts/paginated.dto';
import { PageOptionsDto } from '@/common/dto/offset-pagination.ts/page-options.dto';
import { OffsetPaginationDto } from '@/common/dto/offset-pagination.ts/offset-pagination.dto';


@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}


  async findOne(id: string): Promise<UserResDto> {
    const user = await this.userModel.findById(id).lean().exec();
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }
    return plainToInstance(UserResDto, user);
  }

  async findAll(
    pageOptionsDto: PageOptionsDto,
  ): Promise<OffsetPaginatedDto<UserResDto>> {
    const { limit = 10, q } = pageOptionsDto;

    const filter: FilterQuery<UserDocument> = q ? {
      $or: [
        { email: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
      ],
    } : {};

    const totalRecords = await this.userModel.countDocuments(filter).exec();

    const users = await this.userModel
      .find(filter)
      .limit(limit)
      .skip(pageOptionsDto.offset)
      .lean()
      .exec();

    const userDtos = plainToInstance(UserResDto, users);

    const paginationMeta = new OffsetPaginationDto(totalRecords, pageOptionsDto);

    return new OffsetPaginatedDto<UserResDto>(userDtos, paginationMeta);
  }

}