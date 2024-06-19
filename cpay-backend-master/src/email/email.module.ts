import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EmailService } from './service/email.service';
import { BatchEmailCron } from './service/batch-email.cron';
@Global()
@Module({
  providers: [EmailService, BatchEmailCron],
  imports: [HttpModule],
  exports: [EmailService],
})
export class EmailModule {}
