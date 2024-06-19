import { PaginationDto } from '@app/lib/dto/pagination.dto';
import {
  TransactionCategoryEnum,
  TransactionStatusEnum,
  TransactionTypeEnum,
  WithdrawalRequestsEnum,
} from '../enums/transaction.enum';
import { WalletCurrencyEnum } from 'src/wallet/enum/wallet.enum';
import { ClockPayGraphTypeEnum } from '@app/lib/enum/login.enum';

export class TransactionCreateDto {
  id?: string;
  businessId: string;
  type: TransactionTypeEnum;
  currency: WalletCurrencyEnum;
  amount: number;
  description: string;
  currentBalance: number;
  reference: string;
  category: TransactionCategoryEnum;
  status?: TransactionStatusEnum;
  providerReference?: string;
  previousBalance: number;
  meta?: object;
  sender?: string;
  rateInUsd?: number;
  walletId?: string;
  paymentLinkId?: string;
  cryptoValue?: number;
  charges: number;
  trxAmount?: number;
}

export class ProviderTransactionConfirmationDto {
  event: string;
  data: object;
}

export class CryptoTransactionConfirmationDto {
  trxHash: string;
  reference: string;
  code: string;
}

export class TransactionVerificationCodeDto {
  code: string;
}

export interface AdminTransactionDataDto {
  id: string;
  amount: number;
  rateInUsd: number;
  type: string;
  status: string;
  currency: string;
  category: string;
  currentBalance: number;
  previousBalance: number;
  charges: number;
  trxAmount?: number;
}

export interface TransactionDataDto {
  id: string;
  amount: number;
  rateInUsd: number;
  type: string;
  status: string;
  currency: string;
  category: string;
  charges: number;
  trxAmount?: number;
}

export class TransactionFilterDto extends PaginationDto {
  transactionId: string;
  businessId: string;
  type: TransactionTypeEnum;
  amount: number;
  currency: WalletCurrencyEnum;
  description: string;
  currentBalance: number;
  reference: string;
  status: TransactionStatusEnum;
  providerReference: string;
  ip: string;
  previousBalance: number;
  meta: object;
  category: TransactionCategoryEnum;
  period: ClockPayGraphTypeEnum;
  walletId?: string;
  paymentLinkId: string;
  trxAmount?: number;
}

export class AdminTransactionFilterDto extends PaginationDto {
  transactionId: string[];
  businessId: string[];
  type: TransactionTypeEnum[];
  amount: number;
  currency: WalletCurrencyEnum;
  description: string;
  currentBalance: number;
  reference: string[];
  status: TransactionStatusEnum[];
  providerReference: string;
  previousBalance: number;
  meta: object;
  category: TransactionCategoryEnum;
  period: ClockPayGraphTypeEnum;
  walletId?: string;
  trxAmount?: number;
}

export class CryptoDepositInitializeDto {
  amount: number;
  currency: WalletCurrencyEnum;
  description: string;
  network: string;
  assetId: string;
  walletId: string;
}

export class AdminUpdateWithdrawalRequestDto {
  status: WithdrawalRequestsEnum;
  reason: string;
  requestId: string;
}
