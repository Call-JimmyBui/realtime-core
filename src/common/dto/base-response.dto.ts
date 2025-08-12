import { DateField, UUIDField } from '@/decorators/field.decorators';
import { Exclude, Expose, Transform } from 'class-transformer';

export class BaseResponseDto {

  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  @UUIDField()
  id!: string;

  @Exclude()
  __v?: number;

  @Exclude()
  _id?: string;

  @Expose()
  @DateField({
    nullable: true
  })
  createdAt?: Date;

  @Expose()
  @DateField({
    nullable: true
  })
  updatedAt?: Date;
}
