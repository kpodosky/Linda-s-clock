import * as Joi from 'joi';

export const createSignUpWaitListValidator = Joi.object({
  email: Joi.string().trim().required(),
});

export const createContactSalesValidator = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().trim().required(),
  message: Joi.string().required(),
});
