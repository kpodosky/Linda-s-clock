import { PhoneNumberSchema } from '@app/lib/dto/phone.dto';
import {
  BusinessAccountMemberRoleEnum,
  BusinessAccountModeEnum,
} from '../enum/business.enum';
import { BussinessAccountStatus } from './cpay.user.dto';

export class BusinessCreateDto {
  id?: string;
}

export class BusinessMemberCreateDto {
  businessName: string;
  businessId: string;
  email: string;
  password: string;
  role: BusinessAccountMemberRoleEnum;
  sandBoxVaultId?: string;
}
export class BusinessMemberCreateDbDto {
  name: string;
  businessId: string;
  email: string;
  password: string;
  role: BusinessAccountMemberRoleEnum;
  sandBoxVaultId?: string;
}

export class BusinessConfigCreateDto {
  businessId: string;
  sandboxApiKey: string;
  sandboxPublicKey: string;
}

export class BusinessMemberLoginDto {
  email: string;
  password: string;
}

export class BusinessAddressCreateDto {
  id?: string;
  businessId: string;
}

export class BusinessInformationCreateDto {
  id?: string | null;
  businessId: string;
}

export class BusinessMemberForgotPasswordDto {
  email: string;
}

export class BusinessMemberForgotPasswordConfirmDto {
  memberId: string;
  code: string;
}

export class BusinessMemberForgotPasswordResetDto {
  memberId: string;
  password: string;
  confirmPassword: string;
}

export class BusinessApiKeyRegenerateDto {
  mode: BusinessAccountModeEnum;
}

export class BusinessLocationUpdateDto {
  houseNo: string;
  street: string;
  city: string;
  state: string;
  country: string;
}

export class BusinessInformationUpdateDto {
  website: string;
  industry: string;
  category: string;
  size: string;
  description: string;
  phoneNumber: PhoneNumberSchema;
}

export class BusinessMemberPeronalInformationUpdateDto {
  firstName: string;
  lastName: string;
}

export class AdminUpdatedBusinessStatusDto {
  businessId: string;
  businessStatus: BussinessAccountStatus;
}
