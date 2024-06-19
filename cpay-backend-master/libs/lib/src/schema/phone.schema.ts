import { CountryCodeEnum } from '../enum/country.enum';

export interface PhoneNumberSchema {
  code: CountryCodeEnum;
  number: string;
  local: string;
}
