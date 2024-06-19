import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DecryptionService } from './decryption.service';

@Injectable()
export class DecryptionInterceptor implements NestInterceptor {
  constructor(private readonly decryptionService: DecryptionService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Decrypt the incoming data before processing it
        const decryptedData = this.decryptionService.decrypt(
          data.encryptedData,
        );
        return JSON.parse(decryptedData);
      }),
    );
  }
}
