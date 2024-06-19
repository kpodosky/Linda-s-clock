import * as Joi from 'joi';
import { CountryEnum } from '../enum/country.enum';

export const countryValidator = Joi.object({
  countryCode: Joi.string()
    .trim()
    .valid(...Object.values(CountryEnum))
    .required(),
  country: Joi.string().trim(),
  state: Joi.string().trim(),
  address: Joi.string().trim(),
  city: Joi.string().trim(),
  postalCode: Joi.string().trim(),
});
