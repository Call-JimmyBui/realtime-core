
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AuthProviderType } from '@/constants/entity-enum.constant';
import { hashPassword as hashPass } from '@/utils/password.util';
import { Types } from 'mongoose';

export type AuthProviderDocument = AuthProvider & Document & { _id: Types.ObjectId };;

@Schema({
  collection: 'auth_provider',
  timestamps: true,
})
export class AuthProvider  {

  @Prop({ type: String, enum: AuthProviderType, required: true })
  providerType: AuthProviderType;

  @Prop({ type: String, required: false })
  providerId?: string;

  @Prop({ type: String, required: false, unique: true, index: true })
  email?: string;

  @Prop({ type: String, required: false })
  password?: string;
}

export const AuthProviderSchema = SchemaFactory.createForClass(AuthProvider);

// Hook để hash mật khẩu trước khi lưu
AuthProviderSchema.pre('save', async function (next) {
  const authProvider = this as AuthProviderDocument;
  if (authProvider.isModified('password') && authProvider.password) {
    authProvider.password = await hashPass(authProvider.password);
  }
  next();
});
