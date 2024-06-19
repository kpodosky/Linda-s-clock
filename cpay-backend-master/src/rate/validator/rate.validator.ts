import { paginationValidator } from '@app/lib/validator/paginate.validator';
import * as Joi from 'joi';

export const createNewRateValidator = Joi.object({
  to: Joi.string().trim().lowercase().required(),
  from: Joi.string().lowercase().trim().required(),
  price: Joi.number().required(),
});

export const updateNewRateValidator = Joi.object({
  rateId: Joi.string().trim().required(),
  to: Joi.string().trim().lowercase().required(),
  from: Joi.string().trim().lowercase().required(),
  price: Joi.number().required(),
});

export const filterAllRatesValidator = paginationValidator.append({
  active: Joi.boolean().optional().allow(''),
});

// export const businessFilterAllRatesValidator = paginationValidator.append({
//   active: Joi.boolean().optional().allow(''),
// });
