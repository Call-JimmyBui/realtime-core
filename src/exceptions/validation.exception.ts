import { ErrorCode } from '@/constants/error-code.constants';
import { BadRequestException } from '@nestjs/common';

//Throw validation errors with a custom error code and message
//ErrorCode default is V000 
export class ValidationException extends BadRequestException {
  constructor(error: string = ErrorCode.V000, message?: string) {
    super({ errorCode: error, message });
  }
}