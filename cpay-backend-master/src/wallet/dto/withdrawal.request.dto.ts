import { PaginationDto } from '@app/lib/dto/pagination.dto';
import { TransactionCategoryEnum } from 'src/transaction/enums/transaction.enum';

export interface WithdrawalRequestMeta {
  accountType: string;
  routingNumber: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
export const WithdrawalRequestMetaDefaults: WithdrawalRequestMeta = {
  accountType: null,
  routingNumber: null,
  address: null,
  city: null,
  state: null,
  postalCode: null,
  country: null,
};

export class walletWithdrawalRequestDto {
  amount: number;
  charges: number;
  description: string;
  bankCode: string;
  accountNumber: string;
  currency: string;
  name: string;
  reference: string;
  businessId: string;
  meta?: WithdrawalRequestMeta;
  category: TransactionCategoryEnum;
}

export class walletWithdrawalRequestFilterDto extends PaginationDto {
  transactionId: string;
  businessId: string;
  status: string;
  amount: number;
  name: string;
  bank: string;
  bankCode: string;
  accountNumber: string;
  destinationBranchCode: string;
  currency: string;
  reference: string;
  trxRef: string;
  userId: string;
  category: TransactionCategoryEnum;
}
