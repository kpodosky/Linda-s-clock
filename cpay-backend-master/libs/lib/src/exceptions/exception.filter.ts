import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ExceptionHandler } from './exception.handler';
import { ConfigService } from '@nestjs/config';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly config: ConfigService,
    private readonly sentry?: any,
  ) {}

  logger = new Logger();

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const err = ExceptionHandler(exception, this.config);
    const { status } = err;

    if (
      this.config.get('sentry.dsn') &&
      ![
        HttpStatus.BAD_REQUEST,
        HttpStatus.UNAUTHORIZED,
        HttpStatus.NOT_FOUND,
      ].includes(status) &&
      this.sentry
    ) {
      this.sentry.captureException({
        success: false,
        message: err?.message || 'Error processing request',
        data: err?.data,
        meta: err?.meta,
      });
    }

    this.logger.error(JSON.stringify(err));

    response.status(status).json({
      success: false,
      message: err?.message || 'Error processing request',
      data: err?.data,
      ...err,
    });
  }
}
