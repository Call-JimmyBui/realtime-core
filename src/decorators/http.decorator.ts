import { HttpCode, HttpStatus, type Type, applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { STATUS_CODES } from 'http';
import { Public } from './public.decorator';
import { ApiPaginatedResponse } from './swager.decorator';
import { ErrorDto } from '@/common/dto/error.dto';

type ApiAuthType = 'jwt';

interface IApiOptions<T extends Type<any>> {
  type?: T;
  summary?: string;
  description?: string;
  errorResponses?: HttpStatus[]; 
  statusCode?: HttpStatus;
  isPaginated?: boolean;
  isArray?: boolean;
}

interface IApiAuthOptions extends IApiOptions<Type<any>> {
  authType?: ApiAuthType;
}

export const ApiPublic = (options: IApiOptions<any> = {}): MethodDecorator => {
  const defaultStatusCode = options.isPaginated ? HttpStatus.OK : (options.statusCode || HttpStatus.OK);
  
  const defaultErrorResponses = [
    HttpStatus.BAD_REQUEST, 
    HttpStatus.NOT_FOUND,  
    HttpStatus.UNPROCESSABLE_ENTITY,
    HttpStatus.INTERNAL_SERVER_ERROR, 
  ];
  
  const okResponse = {
    type: options.type,
    description: options.description || 'OK',
    isArray: options.isArray,
  };

  const errorDecorators = (options.errorResponses || defaultErrorResponses).map(
    (statusCode) =>
      ApiResponse({
        status: statusCode,
        type: ErrorDto,
        description: STATUS_CODES[statusCode],
      }),
  );

  const okOrPaginatedResponse = options.isPaginated
    ? ApiPaginatedResponse({ ...okResponse, paginationType: 'offset' })
    : ApiOkResponse(okResponse);

  return applyDecorators(
    Public(),
    HttpCode(defaultStatusCode),
    ApiOperation({ summary: options.summary }),
    okOrPaginatedResponse,
    ...errorDecorators,
  );
};



export const ApiAuth = (options: IApiAuthOptions = {}): MethodDecorator => {
  const defaultStatusCode = options.isPaginated ? HttpStatus.OK : (options.statusCode || HttpStatus.OK);
  
  const defaultErrorResponses = [
    HttpStatus.BAD_REQUEST,     
    HttpStatus.UNAUTHORIZED, 
    HttpStatus.FORBIDDEN,   
    HttpStatus.NOT_FOUND,
    HttpStatus.UNPROCESSABLE_ENTITY,
    HttpStatus.INTERNAL_SERVER_ERROR,
  ];
  
  const errorDecorators = (options.errorResponses || defaultErrorResponses).map(
    (statusCode) =>
      ApiResponse({
        status: statusCode,
        type: ErrorDto,
        description: STATUS_CODES[statusCode],
      }),
  );
  
  const authDecorator = ApiBearerAuth();
  
  let mainResponse: MethodDecorator;
  if (options.isPaginated && options.type) {

    mainResponse = ApiPaginatedResponse({
      type: options.type,
      paginationType: 'offset',
      description: options.description,
    });
  } else if (options.statusCode === HttpStatus.CREATED) {
    mainResponse = ApiCreatedResponse({
      type: options.type,
      description: options.description || 'Created',
      isArray: options.isArray,
    });
  } else {
    mainResponse = ApiOkResponse({
      type: options.type || String,
      description: options.description || 'OK',
      isArray: options.isArray,
    });
  }

  return applyDecorators(
    HttpCode(defaultStatusCode),
    ApiOperation({ summary: options.summary }),
    authDecorator,
    mainResponse,
    ...errorDecorators,
  );
};
