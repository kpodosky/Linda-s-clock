import { PaginationDto } from '@app/lib/dto/pagination.dto';
import { TransactionStatusEnum } from 'src/transaction/enums/transaction.enum';
import { WalletCurrencyEnum } from 'src/wallet/enum/wallet.enum';
import { PaymentLinkTransactionMetaData } from './payment.link.dto';

export class CreatePaymentLinkTransactionDto {
  id?: string;
  businessId: string;
  amount: number;
  status?: TransactionStatusEnum;
  currency: WalletCurrencyEnum;
  paymentLinkId: string;
  description: string;
  senderId: string;
  reference: string;
  previousBalance: number;
  currentBalance: number;
  charges: number;
  transactionId?: string;
  address: string;
  meta?: PaymentLinkTransactionMetaData;
}

export class PaymentLinkTransactionFilterDto extends PaginationDto {
  transactionId?: string;
  businessId: string;
  amount: number;
  status?: TransactionStatusEnum;
  currency: WalletCurrencyEnum;
  paymentLinkId: string;
  description: string;
  senderId: string;
  reference: string;
  previousBalance: number;
  currentBalance: number;
  charges: number;
}
