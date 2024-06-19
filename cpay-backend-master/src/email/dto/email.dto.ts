import { OtpTypeEnum } from 'src/otp/enums/otp.enum';

export class EmailTemplateDataDto {
  email: string;
  username: string;
  subject: string;
  receiver: string;
  cc?: string[];
  preview?: string;
  template: string;
  type?: OtpTypeEnum;
  title?: string;
}

export class EmailRequestDataDto extends EmailTemplateDataDto {
  message?: string;
  code?: string;
  link?: string;
  role?: string;
  amount?: number;
  availableBalance?: number;
  transactionDate?: string;
  reference?: string;
  phoneNumber?: string;
  businessName?: string;
  fullName?: string;
  customerEmail?: string;
  currency?: string;
  coin?: string;
  adminEmail?: string;
  accountOwner?: string;
  businessEmail?: string;
  date?: string;
  reason?: string;
}
