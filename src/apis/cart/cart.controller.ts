import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dtos/create-cart-item.dto';

import { AuthGuard } from '@nestjs/passport';
import { ApiAuth } from '@/decorators/http.decorator';
import { CartResponseDto } from './dtos/cart-response.dto';
import { OrderResponseDto } from '../order/dtos/order-response.dto';
import { CheckoutDto } from './dtos/checkout.dto';
import { OrderDocument } from '../order/schemas/order.schema';
import { UpdateQuantityDto } from './dtos/update-cart-item.dto';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';


@Controller({
  path: 'carts',
  version:'1'
})
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiAuth({
    summary: 'Lấy giỏ hàng',
    type: CartResponseDto,
  })
  async getCart(@CurrentUser('id') userId: string) {    
    return this.cartService.getCart(userId);
  }

  @Post('item')
  @ApiAuth({
    summary: 'Thêm một sản phẩm mới vào giỏ hàng hoặc tăng số lượng.',
    type: CartResponseDto,
  })
  async addItemToCart(
    @CurrentUser('id') userId: string,
    @Body() createCartItemDto: CreateCartItemDto,
  ) {    
    return this.cartService.addItemToCart(userId, createCartItemDto);
  }

  @Patch('item/:productId')
  @ApiAuth({
    summary: 'Cập nhật số lượng sản phẩm trong giỏ hàng',
    type: CartResponseDto,
  })
  async updateItemQuantity(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
    @Body() updateQuantityDto: UpdateQuantityDto,
  ) {
    return this.cartService.updateItemQuantity(
      userId,
      productId,
      updateQuantityDto.quantity,
    );
  }

  @Delete('item/:productId')
  @ApiAuth({
    summary: 'Xóa sản phẩm khỏi giỏ hàng',
    type: CartResponseDto,
  })
  async removeItemFromCart(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItemFromCart(userId, productId);
  }

  @Post('/checkout')
  @ApiAuth({
    summary: 'Thanh toán giỏ hàng',
    type: OrderResponseDto,
    statusCode: HttpStatus.CREATED,
  })
  async checkout(
    @CurrentUser('id') userId: string,
    @Body() checkoutDto: CheckoutDto,
  ): Promise<OrderResponseDto> {
    return this.cartService.checkout(userId, checkoutDto.productIds);
  }
}
