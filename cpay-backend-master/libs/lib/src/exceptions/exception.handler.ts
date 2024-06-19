import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  PreconditionFailedException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErrorResponse } from './exception.types';

export const ExceptionHandler = (exception: any, config: ConfigService) => {
  const logger = new Logger();

  let errorResponse: ErrorResponse = {
    status: exception.status || 500,
    meta: exception._meta,
  };

  if (
    exception instanceof BadRequestException ||
    exception instanceof InternalServerErrorException ||
    exception instanceof NotFoundException ||
    exception instanceof UnauthorizedException ||
    exception instanceof PreconditionFailedException
  ) {
    const exceptionResponse = exception.getResponse() as {
      message: string;
      data: any;
    };

    errorResponse = {
      ...errorResponse,
      message:
        exceptionResponse.message === 'Unexpected field'
          ? 'One or more file fields passed were invalid.'
          : exception.message || exceptionResponse.message,
      data: exceptionResponse.data,
    };
  } else {
    errorResponse = {
      ...errorResponse,
      message:
        exception?.message ||
        exception?.response?.message ||
        exception?.message?.error ||
        exception?.toString(),
    };
  }

  const nodeEnv = config.get('NODE_ENV');

  if (nodeEnv !== 'production') {
    errorResponse.stack = (exception as any).stack;
  }

  logger.error(errorResponse);

  return errorResponse;
};
