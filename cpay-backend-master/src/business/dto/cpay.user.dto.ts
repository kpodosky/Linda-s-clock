import { WalletCurrencyEnum } from 'src/wallet/enum/wallet.enum';
import {
  BusinessDocumentVerificationStatusEnum,
  PersonIdentityVerificationTypeEnum,
} from '../enum/business.enum';
import { CountryEnum } from '@app/lib/enum/country.enum';

export enum CustomerAccountStatus {
  Approved = 'approved',
  Disapproved = 'disapproved',
  pending = 'pending',
}

export const AccountVerificationDefault = {
  emailVerified: false,
  phoneNumberVerified: false,
  kycVerification: CustomerAccountStatus.pending,
};

export const BusinessAccountVerificationDefault = {
  profileCompleted: BusinessDocumentVerificationStatusEnum.default,
  identityVerified: BusinessDocumentVerificationStatusEnum.default,
  addressVerified: BusinessDocumentVerificationStatusEnum.default,
};

export enum verificationLevel {
  level0 = 'level0',
  level1 = 'level1',
  level2 = 'level2',
}

export const AccountAuthenticationDefault = {
  emailAuthentication: false,
  googleAuthentication: false,
};

export enum BussinessAccountStatus {
  Active = 'active',
  Pending = 'pending',
  InActive = 'in-active',
  Blacklisted = 'blacklisted',
}

export class CustomerKycVerificationDto {
  customerId: string;
  number: string;
  image: any;
  countryCode: string;
  type: PersonIdentityVerificationTypeEnum;
}

export class KYBVerificationDto {
  businessId: string;
  number: string;
  countryCode: CountryEnum;
}

export interface isMatchingNameDto {
  providerReturnedFirstName: string;
  providerReturnedLastName: string;
  registeredFirstName: string;
  registeredLastName: string;
}
