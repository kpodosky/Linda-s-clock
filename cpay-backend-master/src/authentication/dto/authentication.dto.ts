export class AccountRegistrationDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export class AccountLoginDto {
  email: string;
  password: string;
}

export class AccountEmailConfirmDto {
  code: string;
}

export class CreateLoginActivityDto {
  userId: string;
  os: string;
  ip: string;
  version: string;
  userAgent: string;
  longitude?: string;
  latitude?: string;
}

export class VerifyQRCodeDataDto {
  code: string;
  secret: string;
}

export class ForgotPasswordDto {
  email: string;
}

export class ForgotPasswordConfirmDto {
  code: string;
  userId: string;
}

export class UpdatePasswordDto {
  userId: string;
  password: string;
  confirmPassword: string;
}

export class SaveLoggedInDeviceDto {
  userId: string;
  os: string;
  versionId: string;
  model: string;
  userAgent: string;
}
