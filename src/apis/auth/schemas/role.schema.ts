
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ROLE } from '@/constants/entity-enum.constant';

export type RoleDocument = Role & Document & { _id: Types.ObjectId };;

@Schema({
  collection: 'role',
  timestamps: true,
})
export class Role {
  
  @Prop({ type: String, enum: ROLE, required: true })
  rolename: ROLE;

  @Prop({ type: String, required: false })
  description?: string;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
