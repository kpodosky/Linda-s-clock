import { PaginationDto } from '@app/lib/dto/pagination.dto';
import { PaymentLinkStatusEnum } from '../enum/payment.link.enum';
import { PhoneNumberSchema } from '@app/lib/dto/phone.dto';
import { CurrencyEnum } from '@app/lib/enum/country.enum';

export class CreatePaymentLinkDto {
  id?: string;
  amount: number;
  variableAmount: boolean;
  url: string;
  redirectUrl: string;
  businessId: string;
  description: string;
  banner: string;
  coinId: string;
  creatorId: string;
  currency: string;
}

export class UpdatePaymentLinkDto {
  paymentLinkId: string;
  amount: number;
  variableAmount: boolean;
  url: string;
  redirectUrl: string;
  businessId: string;
  description: string;
  banner: string;
  coinId: string;
  // networkId: string;
  currency: string;
}

export class EnableAndDisablePaymentLinkDto {
  paymentLinkId: string;
  status: PaymentLinkStatusEnum;
}

export class FilterPaymentLinkDto extends PaginationDto {
  paymentLinkId?: string;
  amount: number;
  variableAmount: boolean;
  url: string;
  redirectUrl: string;
  businessId: string;
  status: PaymentLinkStatusEnum;
}

export class businessCustomerCreateTransactionDto {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  networkId: string;
  paymentLinkId: string;
  amount: number;
  phoneNumber: PhoneNumberSchema;
}

export class CreateBusinessCoinDto {
  id?: string;
  coinId: string;
  paymentLinkId: string;
}
export class BusinessCoinResponseDto {
  name: string;
}
export class noBusinessCustomerFilterTransactionDto {
  id?: string;
  currency: CurrencyEnum;
  variableAmount: boolean;
  status: PaymentLinkStatusEnum;
  url: string;
  title: string;
  redirectUrl: string;
  description: string;
  banner: string;
  businessId: string;
  address?: string;
  scanCode?: string;
  businessLogo?: string;
  coinDetails: object;
  amount: number;
  payableAmount: number;
  business: BusinessCoinResponseDto;
  netWorks: object[];
}

export interface PaymentLinkDataDto {
  id: string;
  amount: number;
  currency: string;
  variableAmount: boolean;
  status: string;
  url: string;
  title: string;
  description: string;
  coin: object;
}

export interface PaymentLinkTransactionMetaData {
  networkId: string;
  coinId: string;
  trxHash?: string;
  cryptoCurrency?: string;
}

export interface AdminFilterNetworkDto extends PaginationDto {
  walletId: string;
  coinId: string;
  businessId: string;
}
