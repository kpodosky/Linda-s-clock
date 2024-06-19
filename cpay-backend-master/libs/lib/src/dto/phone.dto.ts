import { CountryCodeEnum } from '../enum/country.enum';

export class PhoneNumberSchema {
  code: CountryCodeEnum;
  number: string;
  local: string;
}
