import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema, Types, Document } from 'mongoose';
import { CartItem, CartItemSchema } from "./cart-item.schema";

export type CartDocument = Cart & Document & { _id: Types.ObjectId };;

@Schema({ 
    collection: 'carts', 
    timestamps: true 
})
export class Cart {

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];

}

export const CartSchema = SchemaFactory.createForClass(Cart);
