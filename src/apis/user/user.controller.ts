
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '@/decorators/roles.decorator';
import { UserResDto } from './dto/user.res.dto';
import { ApiAuth } from '@/decorators/http.decorator';
import { OffsetPaginatedDto } from '@/common/dto/offset-pagination.ts/paginated.dto';
import { PageOptionsDto } from '@/common/dto/offset-pagination.ts/page-options.dto';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { ROLE } from '@/constants/entity-enum.constant';

@ApiTags('users')
@Controller({
  path: 'users',
  version: '1',
})
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @Roles()
  @ApiAuth({
    summary: 'Lấy thông tin người dùng hiện tại.'
  })
  async getMe(@CurrentUser('id') currentUserId: string): Promise<UserResDto> {
    return this.userService.findOne(currentUserId);
  }
  
  @Get()
  @Roles(ROLE.SUPER_ADMIN)
  @ApiAuth({
    type: UserResDto,
    summary: 'Lấy danh sách tất cả người dùng (phân trang).',
    isPaginated: true
  })
  async getAllUsers(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<OffsetPaginatedDto<UserResDto>> {
    return this.userService.findAll(pageOptionsDto);
  }
}