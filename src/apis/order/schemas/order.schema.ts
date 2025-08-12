import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema, Types, Document } from 'mongoose';
import { OrderStatus } from "../enums/order-status.enum";

export type OrderDocument = Order & Document;

@Schema({ collection: 'orders', timestamps: true })
export class Order {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Number, min: 0 })
  totalAmount: number;

  @Prop({ 
    required: true, 
    type: String, 
    enum: Object.values(OrderStatus), 
    default: OrderStatus.Pending 
  })
  status: OrderStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
