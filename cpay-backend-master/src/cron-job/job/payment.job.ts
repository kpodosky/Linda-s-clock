import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class PaymentLinkJobService {
  private readonly logger = new Logger(PaymentLinkJobService.name);

  constructor(
    @InjectQueue('paymentLinkActions')
    private readonly paymentLinkActionQueue: Queue,
  ) {}

  @Cron('* * * * *')
  // @Cron('37 12 * * *')
  async updateAbandonPayments() {
    try {
      this.logger.log('Scheduling update-abandon-transactions job');
      await this.paymentLinkActionQueue.add(
        'update-abandon-transactions',
        {
          subject: 'Update Abandon Transactions',
          text: 'Updating transactions',
        },
        { priority: 2 },
      );
      this.logger.log('Successfully scheduled update-abandon-transactions job');
    } catch (error) {
      this.logger.error(
        'Error scheduling update-abandon-transactions job',
        error,
      );
    }
  }
}
