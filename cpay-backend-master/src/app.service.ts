import { IInternalServerErrorException } from '@app/lib/exceptions';
import { Injectable } from '@nestjs/common';
import * as moment from 'moment';

@Injectable()
export class AppService {
  health() {
    return {
      status: 'OK',
      timestamp: moment().toISOString(),
    };
  }

  testSentry() {
    throw new IInternalServerErrorException({
      message: 'If sentry works, you would see this on the Sentry dashboard',
      data: {
        status: 'Helloooooo',
        timestamp: moment().toISOString(),
      },
    });
  }
}
