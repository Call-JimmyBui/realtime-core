
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type SessionDocument = Session & Document & { _id: Types.ObjectId };

@Schema({
  collection: 'session',
  timestamps: true,
})
export class Session {
  
  @Prop({ type: String, required: true, index: true })
  hash!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user!: mongoose.Types.ObjectId;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
