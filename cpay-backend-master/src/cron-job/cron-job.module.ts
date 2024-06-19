import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PaymentLinkTransactionJobProcessor } from './processor/cron-job.processor';
import { CronJobHandler } from './handler/cron-job.handler';
import { Transaction } from 'src/transaction/model/transaction.model';
import { PaymentLinkTransactionService } from 'src/payment/service/payment.link.transaction.service';
import { TransactionService } from 'src/transaction/service/transaction.service';
import { PaymentLinkTransaction } from 'src/payment/model/payment.link.transaction.model';
import { PaymentLinkJobService } from './job/payment.job';

@Global()
@Module({
  providers: [
    CronJobHandler,
    PaymentLinkTransactionService,
    TransactionService,
    PaymentLinkTransactionJobProcessor,
    PaymentLinkJobService,
  ],
  imports: [
    HttpModule,
    SequelizeModule.forFeature([Transaction, PaymentLinkTransaction]),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'paymentLinkActions',
    }),
  ],
  exports: [],
})
export class CronJobModule {}
