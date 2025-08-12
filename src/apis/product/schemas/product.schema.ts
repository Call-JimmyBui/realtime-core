import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ 
  collection: 'products',
  timestamps: true 
})
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0 })
  stock: number;
}

export type ProductDocument = Product & Document & { _id: Types.ObjectId };

export const ProductSchema = SchemaFactory.createForClass(Product);
