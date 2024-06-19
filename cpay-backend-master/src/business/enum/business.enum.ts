export enum BusinessAccountModeEnum {
  'sandbox' = 'sandbox',
  'live' = 'live',
}

export enum BusinessAccountMemberStatusEnum {
  'suspended' = 'suspended',
  'active' = 'active',
}

export enum BusinessAccountMemberRoleEnum {
  'owner' = 'owner',
  'admin' = 'admin',
  'support' = 'support',
  'auditor' = 'auditor',
}

export enum BusinessAccountStatusEnum {
  'suspended' = 'suspended',
  'active' = 'active',
  'closed' = 'closed',
}

export enum BusinessAccountVerificationStatusEnum {
  'pending' = 'pending',
  'approved' = 'approved',
  'disapproved' = 'disapproved',
}

export enum BusinessAccountEmailVerificationStatusEnum {
  'pending' = 'pending',
  'confirmed' = 'confirmed',
}

export enum BusinessAddressVerificationStatusEnum {
  'verified' = 'verified',
  'unverified' = 'unverified',
}

export enum PersonIdentityVerificationTypeEnum {
  passport = 'PP',
  driverLicense = 'DL',
  governmentId = 'ID',
}

export enum BusinessDocumentVerificationStatusEnum {
  default = 'default',
  pending = 'pending',
  approved = 'approved',
  disapproved = 'disapproved',
}
