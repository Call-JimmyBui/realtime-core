import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema, Types, Document } from 'mongoose';


export type OrderItemDocument = OrderItem & Document;

@Schema({ collection: 'orderitems', timestamps: true })
export class OrderItem {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Order' })
  orderId: Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Product' })
  productId: Types.ObjectId;

  @Prop({ required: true, type: Number, min: 1 })
  quantity: number;

  @Prop({ required: true, type: Number, min: 0 })
  priceAtTimeOfPurchase: number;

}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
