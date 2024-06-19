import { CoordinateSchema } from '@app/lib/schema/address.schema';
import {
  BusinessDocumentVerificationStatusEnum,
  PersonIdentityVerificationTypeEnum,
} from '../enum/business.enum';
import { CustomerAccountStatus } from '../dto/cpay.user.dto';

export interface AccountVerificationSchema {
  emailVerified: boolean;
  phoneNumberVerified: boolean;
  kycVerification: CustomerAccountStatus;
}

export interface AccountAuthenticationSchema {
  emailAuthentication: boolean;
  googleAuthentication: boolean;
}

export interface VerificationDocumentFieldSchema {
  licenseNumber: string;
  expiryDate: Date;
  image: string;
}

export const VerificationDocumentFieldSchemaDefaults: VerificationDocumentFieldSchema =
  {
    licenseNumber: null,
    expiryDate: null,
    image: null,
  };

export interface AddressSchema extends CoordinateSchema {
  address: string;
  country: string;
  city: string;
  state: string;
}

export interface NotificationPreferenceSchema {
  email: boolean;
  pushNotification: boolean;
  sms: boolean;
  newsLetter: boolean;
}

export const NotificationPreferenceDefault: NotificationPreferenceSchema = {
  email: false,
  pushNotification: false,
  sms: true,
  newsLetter: false,
};

export interface BusinessAccountVerificationSchema {
  profileCompleted: BusinessDocumentVerificationStatusEnum;
  identityVerified: BusinessDocumentVerificationStatusEnum;
  addressVerified: BusinessDocumentVerificationStatusEnum;
}

export interface BusinessAccountPercentageCompletion {
  profile: number;
  document: number;
  business: number;
}

export const BusinessAccountPercentageCompletionDefault: BusinessAccountPercentageCompletion =
  {
    profile: 0,
    document: 0,
    business: 0,
  };

export interface UserAccountVerificationSchema {
  type: PersonIdentityVerificationTypeEnum;
  idNumber: string;
  url: string;
}

export const UserAccountVerificationSchemaDefault: UserAccountVerificationSchema =
  {
    type: null,
    idNumber: null,
    url: null,
  };
