import { InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// READ https://github.com/dcodeIO/bcrypt.js/blob/main/README.md

export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (err) {
    console.error(err);
    throw new InternalServerErrorException('Có lỗi xảy ra khi mã hóa mật khẩu.');
  }
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (err) {
    console.error(err);
    return false;
  }
};
