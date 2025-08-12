import { Exclude, Expose, Type } from 'class-transformer';
import { BooleanField, DateField, EmailField, StringField } from '@/decorators/field.decorators';
import { RoleResDto } from './role-res.dto';
import { BaseResponseDto } from '@/common/dto/base-response.dto';

@Exclude() 
export class UserResDto extends BaseResponseDto {

  @Expose()
  @StringField({
    nullable: true
  })
  username?: string;

  @Expose()
  @EmailField({
    nullable: true
  })
  email?: string;

  @Expose()
  @BooleanField()
  isActive: boolean;

  @Expose()
  @BooleanField()
  isVerify: boolean;
  
  @Expose()
  @Type(() => RoleResDto)
  roles?: RoleResDto[];

}