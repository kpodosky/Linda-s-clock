import { ConfigService } from '@nestjs/config';
import { ConsoleLogger, OnModuleInit } from '@nestjs/common';
import * as Winston from 'winston';

export class CustomLogger extends ConsoleLogger implements OnModuleInit {
  private logger: Winston.Logger;
  onModuleInit() {
    /** wiston configuration */
  }
  constructor(configService: ConfigService) {
    super();
    this.logger = Winston.createLogger({
      transports: [
        // TODO: CHANGE THIS TO USE ELASTIC SEARCH
        new Winston.transports.File({ filename: 'info.log', level: 'info' }),
        new Winston.transports.File({ filename: 'debug.log', level: 'debug' }),
      ],
      format: Winston.format.combine(
        Winston.format.json(),
        Winston.format.timestamp(),
        Winston.format.prettyPrint(),
      ),
    });
  }

  log(message: any, ...optionalParams: any[]) {
    super.log(message, optionalParams);
  }
  error(message: any, ...optionalParams: any[]) {
    if (optionalParams[0] !== 'no console log') {
      super.error(message, optionalParams);
    }
    this.logger.log('error', message);
  }
  debug(message: any, ...optionalParams: any[]) {
    if (optionalParams[0] !== 'no console log') {
      super.log(message, optionalParams);
    }
    this.logger.log('info', message);
  }
}
