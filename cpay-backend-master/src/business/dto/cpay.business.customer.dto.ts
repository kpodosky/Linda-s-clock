import { PhoneNumberSchema } from '@app/lib/dto/phone.dto';

export class CreateBusinessCustomerDto {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  businessId: string;
  phoneNumber: PhoneNumberSchema;
}
