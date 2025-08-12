
import { Exclude, Expose } from 'class-transformer';
import { ROLE } from '@/constants/entity-enum.constant';
import { StringField } from '@/decorators/field.decorators';
import { BaseResponseDto } from '@/common/dto/base-response.dto';

@Exclude()
export class RoleResDto extends BaseResponseDto {

  @Expose()
  @StringField({
    enum: ROLE
  })
  rolename: ROLE;

  @Expose()
  @StringField()
  description: string;

}