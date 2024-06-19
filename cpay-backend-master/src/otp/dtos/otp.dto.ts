import { OtpTypeEnum } from '../enums/otp.enum';

export class OtpDto {
  code: string;
  id: string;
  receiver: string;
  type: OtpTypeEnum;
  reference?: string;
}

export class ResetPasswordDto extends OtpDto {
  password: string;
}

export class UpdateEmailDto extends OtpDto {
  newEmail: string;
}
