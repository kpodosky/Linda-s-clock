import { SetMetadata } from '@nestjs/common';

export class BusinessTokenDto {
  id: string;
  role?: string;
  businessId?: string;
  ip?: string;
  email: string;
  /** added by jwt  */
  iat?: number;
  exp?: number;
}

export class AdminTokenDto {
  id: string;
  email: string;
  role: string;
  permission?: string[];
  iat?: number;
  exp?: number;
}

export type RefreshTokenDto = Pick<BusinessTokenDto, 'id' | 'iat' | 'exp'>;
export type AdminRefreshTokenDto = Pick<AdminTokenDto, 'id' | 'iat' | 'exp'>;

export const SKIP_AUTH_GUARD_KEY = 'SKIP_AUTH_GUARD_KEY';
export const REQUIRED_KYB = 'REQUIRED_KYB';
export const REQUIRED_BANK_ID = 'REQUIRED_BANK_ID';
export const REQUIRE_2FA_KEY = 'REQUIRE_2FA_KEY';
export const REQUIRED_KYC = 'REQUIRED_KYC';
export const REQUIRED_ACCOUNT_OWNER = 'REQUIRED_ACCOUNT_OWNER';
export const SKIP_TWO_FACTOR_AUTH = 'SKIP_TWO_FACTOR_AUTH';

export const SkipAuthGuard = () => SetMetadata(SKIP_AUTH_GUARD_KEY, true);
export const RequiredKYBGuard = () => SetMetadata(REQUIRED_KYB, true);
export const RequiredKYCGuard = () => SetMetadata(REQUIRED_KYC, true);
export const RequiredBankGuard = () => SetMetadata(REQUIRED_BANK_ID, true);
export const SkipTwoFactorAuthGuard = () =>
  SetMetadata(SKIP_TWO_FACTOR_AUTH, true);
export const RequiredAccountOwnerGuard = () =>
  SetMetadata(REQUIRED_ACCOUNT_OWNER, true);
