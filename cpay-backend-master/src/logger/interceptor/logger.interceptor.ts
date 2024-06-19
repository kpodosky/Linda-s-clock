import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { catchError, Observable, throwError } from 'rxjs';

export class LoggerInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();
    const query = JSON.stringify(req.query);
    const body = JSON.stringify(req.body);
    const params = JSON.stringify(req.params);
    const user = JSON.stringify(res?.locals?.tokenData ?? {});
    /** log normal request as info to file  */
    Logger.debug(
      JSON.stringify(
        {
          query,
          body: JSON.stringify(body, null, 2),
          params,
          user,
        },
        null,
        2,
      ),
      'no console log',
    );
    return next.handle().pipe(
      catchError((error) => {
        return throwError(() => {
          /** only log errors to the database */
          Logger.error(
            JSON.stringify(
              {
                query,
                body,
                params,
                user,
                error,
              },
              null,
              2,
            ),
            'no console log',
          );
          return error;
        });
      }),
    );
  }
}
