import { PaginationDto } from '@app/lib/dto/pagination.dto';
import { BussinessAccountStatus, verificationLevel } from './cpay.user.dto';
import { PhoneNumberSchema } from '@app/lib/dto/phone.dto';
import { PersonIdentityVerificationTypeEnum } from '../enum/business.enum';

export class createBusinesDto {
  id?: string;
  name: string;
  email: string;
  industry: string;
  ownerId: string;
  accountId: string;
}

export class sendAccessInviteDto {
  email: string;
  roleId: string;
  businessId: string;
}

export class removeAccessInviteDto {
  userId: string;
  businessId: string;
}

export class roleFilterDto extends PaginationDto {
  roleId: string;
}

export class BusinessMemberFilterDto extends PaginationDto {
  businessId: string;
}

export class BusinessFilterDto extends PaginationDto {
  businessId: string;
  status: string;
  industry: string;
  level: verificationLevel;
  profileCompleted: boolean;
  identityVerified: boolean;
  addressVerified: boolean;
  businessStatus: BussinessAccountStatus;
}

export class BusinessLocationUpdateDto {
  businessId: string;
  houseNo?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export class BusinessLocationFilterDto extends PaginationDto {
  locationId: string;
  businessId: string;
  houseNo: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export class BusinessProfileUpdateDto {
  businessId: string;
  businessCertificateImage?: string;
  registrationNumber?: string;
  email?: string;
  phoneNumber?: PhoneNumberSchema;
  size?: string;
  description?: string;
  website?: string;
  businessRegistrationDocument?: string;
}

export class BusinessUser2FAUpdateDto {
  key: string;
  value: boolean;
}

export class BusinessStatusUpdateDto {
  businessId: string;
}

export class PersonalAccountDeletionDto {
  reason: string;
}

export class SimpleAddressDto {
  country: string;
  iso2: string;
  iso3: string;
  address: string;
  state: string;
}

export class PersonalInformationUpdateDto {
  phoneNumber: PhoneNumberSchema;
  type: PersonIdentityVerificationTypeEnum;
  idNumber: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  image: string;
  address: SimpleAddressDto;
}

export class BusinessInformationUpdateDto {
  businessId: string;
  registrationNumber: string;
  email: string;
  phoneNumber: PhoneNumberSchema;
  size: string;
  description: string;
  website: string;
  houseNo: string;
  address: string;
  city: string;
  state: string;
  country: string;
  businessLogo: string;
  businessRegistrationDocument: string;
}
