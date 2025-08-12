import {
  Controller,
  Get,
  Param,
  UseGuards,
  Patch,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse } from '@nestjs/swagger';
import { ROLE } from '@/constants/entity-enum.constant';
import { ApiAuth } from '@/decorators/http.decorator';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { Roles } from '@/decorators/roles.decorator';
import { OrderResponseDto } from './dtos/order-response.dto';
import { UpdateOrderStatusDto } from './dtos/update-order.dto';
import { OrderService } from './order.service';
import { RolesGuard } from '@/guards/roles.guard'; // Giả sử đã có RolesGuard

@Controller('orders')
@UseGuards(AuthGuard('jwt'), RolesGuard) // Thêm RolesGuard vào đây
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiAuth({
    summary: 'Lấy tất cả các đơn hàng của người dùng hiện tại',
    type: OrderResponseDto,
  })
  @ApiOkResponse({ type: OrderResponseDto })
  async getUserOrders(@CurrentUser('id') userId: string) {
    return this.orderService.getUserOrders(userId);
  }

  @Get(':orderId')
  @ApiAuth({
    summary: 'Lấy thông tin chi tiết của một đơn hàng cụ thể',
    type: OrderResponseDto,
  })
  async getOrderById(
    @CurrentUser('id') userId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.orderService.getOrderById(userId, orderId);
  }

  @Patch(':orderId/status')
  @Roles(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN)
  async updateOrderStatus(
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') roles: ROLE[],
    @Param('orderId') orderId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(
      userId,
      orderId,
      updateOrderStatusDto.status,
      roles
    );
  }
}