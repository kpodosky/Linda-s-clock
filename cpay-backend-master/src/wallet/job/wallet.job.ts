import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { Op } from 'sequelize';
import { TransactionService } from 'src/transaction/service/transaction.service';

@Injectable()
export class WalletJobService {
  private readonly from: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly transactionService: TransactionService,
  ) {}

  @Cron('* * * * * *')
  async endExpiredSafeLocks() {}
}
