import { CustomLogger } from './service/logger.service';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [CustomLogger],
  exports: [CustomLogger],
})
export class LoggerModule {}
