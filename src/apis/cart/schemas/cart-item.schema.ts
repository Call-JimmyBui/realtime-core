import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema, Types, Document } from 'mongoose';


export type CartItemDocument = CartItem & Document & { _id: Types.ObjectId };;

@Schema({ collection: 'cartitems', timestamps: true })
export class CartItem {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Cart' })
  cartId: Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Product' })
  productId: Types.ObjectId;

  @Prop({ required: true, type: Number, min: 1 })
  quantity: number;

  @Prop({ required: true, type: Number, min: 1 })
  price: number;

}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);
