
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types, Document } from 'mongoose';

export type UserDocument = User & Document & { _id: Types.ObjectId };

@Schema({
  collection: 'user',
  timestamps: true,
})
export class User {

  @Prop({ type: String, maxlength: 50 })
  username?: string; 

  @Prop({ type: String, required: false, unique: true, index: true })
  email?: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false })
  isVerify: boolean;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Session' }] })
  sessions?: Types.ObjectId[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Role' }] })
  roles?: Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AuthProvider' })
  authProviderId!: Types.ObjectId;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);