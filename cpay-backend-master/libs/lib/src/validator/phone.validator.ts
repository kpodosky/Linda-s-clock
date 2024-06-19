import * as Joi from 'joi';
import { CountryCodeEnum } from '../enum/country.enum';

export const phoneNumberValidator = Joi.object({
  code: Joi.string()
    .trim()
    .valid(...Object.values(CountryCodeEnum))
    .required(),
  number: Joi.string()
    .trim()
    // .conditional('code', {
    //   switch: [
    //     {
    //       is: CountryCodeEnum.NGN,
    //       then: Joi.string().trim().min(10).max(10).required(),
    //     },
    //     {
    //       is: CountryCodeEnum.USA,
    //       then: Joi.string().trim().min(10).max(10).required(),
    //     },
    //   ],
    // })
    .required(),

  local: Joi.string().trim(),
}).custom((value) => {
  switch (value.code) {
    case CountryCodeEnum.NGN:
      //for nigerian numbers add 0 to the front of the number
      value.local = `0${value.number}`;
      break;
    case CountryCodeEnum.USA:
      // for the USA only the 10 digits numbers are considered to be local numbers
      value.local = value.number;
      break;
    default:
      value.local = value.number;
    // TODO: AS THE COMPANY EXPANDS TO OTHER COUNTRIES ADD RULES HERE, TO ENSURE THAT WE HAVE THE RIGHT VALUE FOR LOCAL. phoneNumber.local can be used alongside email to login to the platform
  }
  return value;
});
