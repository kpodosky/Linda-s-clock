import { PaginationDto } from '@app/lib/dto/pagination.dto';
import { FiatWalletCurrencyEnum } from 'src/wallet/enum/wallet.enum';

export class AddBankAccountDto {
  accountName: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  currency: FiatWalletCurrencyEnum;
  businessId: string;
}

export class BankAccountSearchValidatorDto extends PaginationDto {
  accountName: string;
  bankName: string;
  currency: FiatWalletCurrencyEnum;
  businessId: string;
}

export class RemoveBankAccountDto {
  bankAccountId: string;
}

export class bankListQueryDto extends PaginationDto {
  currency: FiatWalletCurrencyEnum;
}

export class BankDetailsVerificationDto {
  bankCode: string;
  accountNumber: string;
}

export interface BankMeta {
  accountType: string;
  routingNumber: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
export const BankMetaMetaDefault: BankMeta = {
  accountType: null,
  routingNumber: null,
  address: null,
  city: null,
  state: null,
  postalCode: null,
  country: null,
};
