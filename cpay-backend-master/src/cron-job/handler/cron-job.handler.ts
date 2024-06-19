import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CronJobHandler {
  private readonly logger = new Logger(CronJobHandler.name);
}
