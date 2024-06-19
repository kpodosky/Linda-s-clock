import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  NotFoundException,
  Catch,
  ExceptionFilter,
  ArgumentsHost,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class NotFoundInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('see........');
    return next.handle().pipe(
      catchError((error) => {
        console.log('con....', error);
        if (error instanceof NotFoundException) {
          // Modify the response for 404 errors
          return throwError({
            statusCode: 404,
            message: 'Custom Not Found Message',
          });
        }
        // Re-throw other errors
        return throwError(error);
      }),
    );
  }
}

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    response.status(404).send({ message: 'Resouce not found' });
    // response.sendFile('./path/to/your/404-page.html');
  }
}
