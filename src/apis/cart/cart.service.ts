import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { CreateCartItemDto } from './dtos/create-cart-item.dto';
import { ProductService } from '../product/product.service';
import { ProductDocument } from '../product/schemas/product.schema';
import { Order, OrderDocument } from '../order/schemas/order.schema';
import { createCacheKey } from '@/utils/cache-key';
import { CacheKey } from '@/constants/cache.constant';
import { RedisService } from '@/redis/redis.service';
import { OrderStatus } from '../order/enums/order-status.enum';
import { CartResponseDto } from './dtos/cart-response.dto';
import { plainToInstance } from 'class-transformer';
import { OrderResponseDto } from '../order/dtos/order-response.dto';

@Injectable()
export class CartService {
  constructor(
    private readonly productService: ProductService,
    private readonly redisService: RedisService,
    
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
  ) {}


  async addItemToCart(userId: string, createCartItemDto: CreateCartItemDto): Promise<CartResponseDto> {
    const { productId, quantity } = createCartItemDto;
    
    const product = await this.findProductOrThrow(productId);
    const cart = await this.getOrCreateCart(userId)
    const existingItem = cart.items.find(item => item.productId.toString() === productId);

    let updatedCart: CartDocument | null;

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new UnprocessableEntityException('Tổng số lượng vượt quá tồn kho.');
      }
      updatedCart = await this.cartModel.findOneAndUpdate(
        { userId, 'items.productId': productId },
        { 
          $inc: { 'items.$.quantity': quantity },
          $set: { 'items.$.price': product.price } 
        },
        { new: true }
      )
      .lean()
      .exec();
    } else {
      if (product.stock < quantity) {
        throw new UnprocessableEntityException('Số lượng sản phẩm trong kho không đủ.');
      }
      updatedCart = await this.cartModel.findOneAndUpdate(
        { userId },
        { $push: { items: { productId: new Types.ObjectId(productId), quantity, price: product.price } } },
        { new: true } 
      )
      .lean()
      .exec();
    }
    
    if (!updatedCart) {
      throw new NotFoundException('Không tìm thấy giỏ hàng sau khi cập nhật.');
    }

    await this.redisService.del(createCacheKey(CacheKey.CART_FIND_ONE, userId));
    return plainToInstance(CartResponseDto, updatedCart);
  }


  async updateItemQuantity(
    userId: string,
    productId: string,
    newQuantity: number
  ): Promise<CartResponseDto> {

    const product = await this.findProductOrThrow(productId);

    if (product.stock < newQuantity) {
      throw new UnprocessableEntityException('Số lượng yêu cầu vượt quá tồn kho.');
    }

    const updatedCart = await this.cartModel.findOneAndUpdate(
      { userId, 'items.productId': productId },
      { '$set': { 'items.$.quantity': newQuantity } },
      { new: true }
    )
    .lean()
    .exec();
    
    if (!updatedCart) {
      throw new NotFoundException('Không tìm thấy giỏ hàng hoặc sản phẩm để cập nhật.');
    }

    await this.redisService.del(createCacheKey(CacheKey.CART_FIND_ONE, userId));
    
    return plainToInstance(CartResponseDto, updatedCart);
  }


  async removeItemFromCart(userId: string, productId: string): Promise<CartResponseDto> {

    await this.findProductOrThrow(productId);

    const updatedCart = await this.cartModel.findOneAndUpdate(
      { userId },
      { '$pull': { items: { productId: new Types.ObjectId(productId) } } },
      { new: true }
    )
    .lean()
    .exec();

    if (!updatedCart) {
      throw new NotFoundException('Không tìm thấy giỏ hàng để xóa sản phẩm.');
    }

    await this.redisService.del(createCacheKey(CacheKey.CART_FIND_ONE, userId));
    return plainToInstance(CartResponseDto, updatedCart);
  }


  async checkout(userId: string, productIds: string[]): Promise<OrderResponseDto> {
    
    const cart = await this.cartModel.findOne({ userId }).exec();
    if (!cart || cart.items.length === 0) {
      throw new UnprocessableEntityException('Giỏ hàng trống, không thể thanh toán.');
    }

    const itemsToCheckout = cart.items.filter(item => 
      productIds.includes(item.productId.toString())
    );
    if (itemsToCheckout.length === 0) {
      throw new UnprocessableEntityException('Không có sản phẩm để thanh toán.');
    }

    let totalAmount = 0;
    for (const item of itemsToCheckout) {
      totalAmount += item.price * item.quantity; 
      await this.productService.updateStock(item.productId.toString(), item.quantity);
    }
    
    const newOrder = await this.orderModel.create({
      userId: new Types.ObjectId(userId),
      items: itemsToCheckout,
      status: OrderStatus.Pending,
      totalAmount: totalAmount,
    });

    await this.cartModel.updateOne(
      { userId },
      { '$pull': { items: { productId: { '$in': productIds.map(id => new Types.ObjectId(id)) } } } }
    ).exec();
    
    return plainToInstance(OrderResponseDto, newOrder.toObject());
  }
  

  async getCart(userId: string): Promise<CartResponseDto> {
    const cacheKey = createCacheKey(CacheKey.CART_FIND_ONE, userId);
    let cartFromCache = await this.redisService.get<CartDocument>(cacheKey);

    if (cartFromCache) {
      return plainToInstance(CartResponseDto, cartFromCache);
    }

    const cartFromDb = await this.cartModel.findOne({ userId }).lean().exec();

    if (!cartFromDb) {
      throw new NotFoundException('Không tìm thấy giỏ hàng của bạn.');
    }

    await this.redisService.set(cacheKey, cartFromDb, 60);

    return plainToInstance(CartResponseDto, cartFromDb);
  }

  async getOrCreateCart(userId: string): Promise<CartDocument> {
    return this.cartModel.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, items: [] } },
      { new: true, upsert: true }
    ).exec();
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartModel.updateOne({ userId }, { '$set': { items: [] } }).exec();
  }


  private async findProductOrThrow(productId: string): Promise<ProductDocument> {

    const cacheKey = createCacheKey(CacheKey.PRODUCT_FIND_ONE, productId);

    let product = await this.redisService.get<ProductDocument>(cacheKey);

    if (!product) {      
      product = await this.productService.findOne(productId);
      if (!product) {
        throw new NotFoundException('Không tìm thấy sản phẩm.');
      }
      await this.redisService.set(cacheKey, product, 300);
    }

    return product;
  }
}
