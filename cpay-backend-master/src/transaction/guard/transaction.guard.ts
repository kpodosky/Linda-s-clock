import {
  ConflictException,
  Injectable,
  Logger,
  PipeTransform,
} from '@nestjs/common';
import { WithdrawalRequestService } from 'src/wallet/service/withdrawal.request.service';
import { TransactionService } from '../service/transaction.service';
import {
  TransactionStatusEnum,
  WithdrawalRequestsEnum,
} from '../enums/transaction.enum';
