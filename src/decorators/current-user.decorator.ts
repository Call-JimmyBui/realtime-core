import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();    
    const user = (request as any)['user']; 
    console.log('usre', user);
    
    return data ? user?.[data] : user;
  },
);