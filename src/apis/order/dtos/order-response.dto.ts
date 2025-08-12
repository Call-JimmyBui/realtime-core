import { Expose, Type } from 'class-transformer';
import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { NumberField, StringField } from '@/decorators/field.decorators';
import { OrderStatus } from '../enums/order-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto extends BaseResponseDto {
  @Expose({ name: 'orderId'})
  orderId: string;

  @Expose({ name: 'productId' })
  productId: string;

  @Expose()
  @NumberField({ 
    min: 0,
    example: 100
  })
  quantity: number;

  @Expose()
  @NumberField({ 
    min: 0
  })
  priceAtTimeOfPurchase: number;
}

export class OrderResponseDto extends BaseResponseDto {

  @Expose({ name: 'userId' })
  @StringField()
  userId: string;

  @Expose()
  @NumberField({ 
    min: 0,
    example: 100
  })
  totalAmount: number;

  @Expose()
  @StringField({
    enum: OrderStatus
  })
  status: OrderStatus;
  
  @Expose()
  @Type(() => OrderItemDto)
  @ApiProperty({
    type: [OrderItemDto],    
  })
  items: OrderItemDto[];
}
