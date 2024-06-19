import {
  OnQueueCompleted,
  OnQueueError,
  Process,
  Processor,
} from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Job } from 'bull';
import { Op } from 'sequelize';
import * as moment from 'moment';
import { TransactionService } from 'src/transaction/service/transaction.service';
import { PaymentLinkTransactionService } from 'src/payment/service/payment.link.transaction.service';
import { TransactionStatusEnum } from 'src/transaction/enums/transaction.enum';

@Processor('paymentLinkActions')
export class PaymentLinkTransactionJobProcessor {
  private readonly logger = new Logger(PaymentLinkTransactionJobProcessor.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly transactionService: TransactionService,
    private readonly eventEmitter: EventEmitter2,
    private readonly paymentLinkTransactionService: PaymentLinkTransactionService,
  ) {}

  @Process('update-abandon-transactions')
  async updateAbandonPayments(job: Job<unknown>) {
    this.logger.log('Starting update-abandon-transactions job', job.data);
    const batchSize = 1000;
    let offset = 0;
    let paymentLinkTransactions;
    const now = moment();
    const oneHourAgo = now.clone().subtract(1, 'hour');

    do {
      paymentLinkTransactions =
        await this.paymentLinkTransactionService.findAll({
          where: {
            status: TransactionStatusEnum.Pending,
            createdAt: {
              [Op.lt]: oneHourAgo.toDate(), 
            },
          },
          limit: batchSize,
          offset: offset,
          order: [['createdAt', 'DESC']],
        });

      for (const paymentLinkTransaction of paymentLinkTransactions) {
        const transaction = await this.transactionService.findOne({
          where: {
            reference: paymentLinkTransaction.reference,
          },
        });

        if (transaction) {
          transaction.status = TransactionStatusEnum.Abandoned;
          await transaction.save();
          paymentLinkTransaction.status = TransactionStatusEnum.Abandoned;
          await paymentLinkTransaction.save();
        }
      }

      offset += batchSize;
    } while (paymentLinkTransactions.length === batchSize);

    this.logger.log('Completed update-abandon-transactions job');
  }

  @OnQueueError()
  queueError(error: Error) {
    this.logger.error('Error in paymentLinkActions queue', error);
  }

  @OnQueueCompleted()
  queueCompleted(job: Job) {
    this.logger.log('Completed paymentLinkActions job', job.data);
  }
}
