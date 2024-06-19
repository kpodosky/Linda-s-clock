import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { EncryptionService } from './encryption.service';

@Injectable()
export class EncryptionInterceptor implements NestInterceptor {
  constructor(private readonly encryptionService: EncryptionService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object') {
          const encryptedData = this.encryptResponse(data);
          return { ...encryptedData };
        }
        return data;
      }),
      catchError((error) => {
        if (
          error instanceof BadRequestException ||
          error instanceof InternalServerErrorException
        ) {
          const encryptedErrorMessage = this.encryptionService.encrypt(
            error.message,
          );
          return throwError(new BadRequestException(encryptedErrorMessage));
        }
        return throwError(error);
      }),
    );
  }

  private encryptResponse(responeDate: any): any {
    const encryptedMessage = this.encryptionService.encrypt(
      responeDate.message,
    );
    const encryptedData = responeDate.data
      ? this.encryptionService.encrypt(JSON.stringify(responeDate.data))
      : this.encryptionService.encrypt(JSON.stringify(responeDate));

    return {
      message: encryptedMessage,
      data: encryptedData,
    };
  }
}
