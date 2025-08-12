import { Expose, Type } from 'class-transformer';
import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { NumberField, StringField } from '@/decorators/field.decorators';
import { ApiProperty } from '@nestjs/swagger';
import { OrderItemDto } from '@/apis/order/dtos/order-response.dto';

export class CartItemResponseDto extends BaseResponseDto {

  @Expose({ name: 'cartId' })
  @StringField()
  cartId: string;

  @Expose({ name: 'productId' })
  @StringField()
  productId: string;

  @Expose()
  @NumberField({
    min: 0
  })
  quantity: number;
}

export class CartResponseDto extends BaseResponseDto {
  @Expose({ name: 'userId' })
  @StringField()
  userId: string;

  @Expose()
  @Type(() => CartItemResponseDto)
  @ApiProperty({
    type: [OrderItemDto],    
  })
  items: CartItemResponseDto[];
}
