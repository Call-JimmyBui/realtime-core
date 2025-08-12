import crypto from 'crypto';

// READ: https://nodejs.org/api/crypto.html#cryptogeneratekeypairsynctype-options

export const generateKeyPair = () => {

  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
};