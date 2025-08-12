import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Order, OrderDocument } from './schemas/order.schema';
import { CartDocument } from '../cart/schemas/cart.schema';
import { RedisService } from '@/redis/redis.service';
import { createCacheKey } from '@/utils/cache-key';
import { CacheKey } from '@/constants/cache.constant';
import { OrderStatus } from './enums/order-status.enum';
import { ProductService } from '../product/product.service';
import { ROLE } from '@/constants/entity-enum.constant';
import { TRANSITION_RULES } from './constants/status-transition.constant';

interface OrderItem {
  productId: Types.ObjectId;
  quantity: number;
  priceAtTimeOfPurchase: number;
}

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    private readonly productService: ProductService, 
    private readonly redisService: RedisService,
  ) {}

  async getUserOrders(userId: string): Promise<OrderDocument[]> {
    const cacheKey = createCacheKey(CacheKey.USER_ORDERS, userId);
    let orders = await this.redisService.get<OrderDocument[]>(cacheKey);

    if (!orders) {
      orders = await this.orderModel.find({ userId: new Types.ObjectId(userId) }).exec();
      if (orders.length > 0) {
        await this.redisService.set(cacheKey, orders, 300); 
      }
    }
    return orders;
  }

  async getOrderById(userId: string, orderId: string): Promise<OrderDocument> {
    const cacheKey = createCacheKey(CacheKey.ORDER_FIND_ONE, orderId);
    let order = await this.redisService.get<OrderDocument>(cacheKey);

    if (!order) {
      const foundOrder = await this.orderModel.findOne({ 
        _id: new Types.ObjectId(orderId), 
        userId: new Types.ObjectId(userId) 
      }).exec();
      
      if (!foundOrder) {
        throw new NotFoundException('Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập.');
      }
      
      order = foundOrder;
      await this.redisService.set(cacheKey, order, 300); 
    }
    return order;
  }

  async updateOrderStatus(
    userId: string,
    orderId: string,
    newStatus: OrderStatus,
    userRoles: ROLE[],
  ): Promise<OrderDocument> {
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng.');
    }

    const highestRole = this.getHighestRole(userRoles);

    this.validateStatusTransition(highestRole, order.status, newStatus);
    
    order.status = newStatus;
    const updatedOrder = await order.save();

    await this.redisService.del(createCacheKey(CacheKey.ORDER_FIND_ONE, orderId));
    await this.redisService.del(createCacheKey(CacheKey.USER_ORDERS, userId));

    return updatedOrder;
  }

  private validateStatusTransition(
    userRole: ROLE,
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ): void {
    const roleRules = TRANSITION_RULES[userRole];
    if (!roleRules) {
      throw new UnprocessableEntityException('Vai trò người dùng không hợp lệ.');
    }

    const allowedTransitions = roleRules[currentStatus];

    if (!allowedTransitions) {
      throw new UnprocessableEntityException(
        `Không thể chuyển từ trạng thái "${currentStatus}" sang "${newStatus}" với vai trò của bạn.`
      );
    }
  }

  async createOrderFromCart(userId: string, cart: CartDocument): Promise<OrderDocument> {
    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    for (const item of cart.items) {
      const product = await this.productService.findOne(item.productId.toString());
      if (!product || product.stock < item.quantity) {
        throw new UnprocessableEntityException(`Sản phẩm '${product?.name}' không đủ hàng.`);
      }

      await this.productService.updateStock(item.productId.toString(), item.quantity);

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtTimeOfPurchase: product.price,
      });
      totalAmount += product.price * item.quantity;

      await this.redisService.del(createCacheKey(CacheKey.PRODUCT_FIND_ONE, item.productId.toString()));
    }

    const newOrder = await this.orderModel.create({
      userId: new Types.ObjectId(userId),
      items: orderItems,
      totalAmount: totalAmount,
      status: OrderStatus.Pending,
    });
    
    await this.redisService.del(createCacheKey(CacheKey.USER_ORDERS, userId));

    return newOrder;
  }


  private getHighestRole(roles: ROLE[]): ROLE {
    if (roles.includes(ROLE.SUPER_ADMIN)) return ROLE.SUPER_ADMIN;
    if (roles.includes(ROLE.ADMIN)) return ROLE.ADMIN;
    return ROLE.USER;
  }
}