
import * as jwt from 'jsonwebtoken';

// READ https://github.com/auth0/node-jsonwebtoken/blob/master/README.md

export const createTokenPair = (
  payload: object,
  privateKey: string
): { accessToken: string; refreshToken: string } => {

  // Access token expires in 1 hour
  const accessToken = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: '1h',
  });

  // Refresh token expires in 7 days
  const refreshToken = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};