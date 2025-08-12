import { Uuid } from '@/common/type/common-type';

export type JwtRefreshPayloadType = {
  sessionId: Uuid;
  hash: string;
  iat: number;
  exp: number;
};