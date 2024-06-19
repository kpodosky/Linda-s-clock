import { phoneNumberValidator } from '@app/lib/validator/phone.validator';
import * as Joi from 'joi';

export const BusinessCustomerCreateValidator = Joi.object().keys({
  firstName: Joi.string().trim().optional().trim().messages({
    'string.base': `House number should be a ftype of string`,
    'any.required': `House number field cannot be empty`,
  }),

  lastName: Joi.string().trim().optional().trim().messages({
    'string.base': `Street should be a type of number`,
    'any.required': `Street field cannot be empty`,
  }),

  email: Joi.string().email().lowercase().trim().optional().trim().messages({
    'string.base': `City should be a type of number`,
    'any.required': `City field cannot be empty`,
  }),

  businessId: Joi.string().trim().optional().trim().messages({
    'string.base': `State should be a type of number`,
    'any.required': `State field cannot be empty`,
  }),

  phoneNumber: phoneNumberValidator.optional().allow(''),
});
