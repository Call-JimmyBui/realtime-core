import { Expose } from 'class-transformer';
import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { NumberField, StringField } from '@/decorators/field.decorators';

export class ProductResponseDto extends BaseResponseDto {

  @Expose()
  @StringField()
  name: string;

  @Expose()
  @StringField({
    nullable: true
  })
  description?: string;

  @Expose()
  @NumberField({
    min: 0
  })
  price: number;

  @Expose()
  @NumberField({
    min: 0
  })
  stock: number;

}
