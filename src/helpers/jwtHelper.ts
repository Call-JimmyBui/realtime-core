import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtHelper {
  async generateToken(payload: any, privateKey: string, tokenLife: string): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        { data: payload },
        privateKey,
        {
          algorithm: 'RS256',
          expiresIn: tokenLife,
        },
        (error, token) => {
          if (error) {
            return reject(error);
          }
          resolve(token as string);
        },
      );
    });
  }

  async verifyToken(token: string, publicKey: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, publicKey, (error, decoded) => {
        if (error) {
          return reject(error);
        }
        resolve(decoded);
      });
    });
  }
}
