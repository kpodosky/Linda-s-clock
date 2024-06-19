import { WaitlistCategory } from '../enum/waitlist.enum';

export class SignUpWaitlistDto {
  id?: string;
  fullName: string;
  company: string;
  companyName: string;
  email: string;
  type: WaitlistCategory;
}

export class ContactSalesDto {
  name: string;
  email: string;
  reason: string;
}
