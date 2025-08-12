
import { CacheKey } from '@/constants/cache.constant';
import * as util from 'util';

// READ https://nodejs.org/api/util.html#utilformatformat-args

export const createCacheKey = (key: CacheKey, ...args: string[]): string => {
  return util.format(key, ...args);
};
