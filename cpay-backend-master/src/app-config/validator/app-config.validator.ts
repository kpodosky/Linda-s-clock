import * as Joi from 'joi';

export const smsProviderValidaator = Joi.object({
  dojah: Joi.boolean().required(),
  termii: Joi.boolean().required(),
});

export const nidiConfiguations = Joi.object({
  smsProvider: smsProviderValidaator.required(),
  amount: Joi.number().required(),
  timeUnit: Joi.string().required(),
});

export const appConfigurationsValidator = Joi.object({
  nidiConfiguations: nidiConfiguations.required(),
});

export const configCreatePricesValidator = Joi.object({
  depositChargesInPercent: Joi.number().min(0).required().messages({
    'string.base': `Deposit charges amount should be a type of 'number'`,
    'any.required': `Deposit charges amount cannot be empty`,
  }),
  withdrawalCharges: Joi.number().min(0).required().messages({
    'string.base': `Withdrawal charges amount should be a type of 'number'`,
    'any.required': `Withdrawal charges amount cannot be empty`,
  }),
  isDepositAvailable: Joi.boolean().required(),
  isWithdrawalAvailable: Joi.boolean().required(),
  isLoginAvailable: Joi.boolean().required(),
});

export const configUpdatePricesValidator = Joi.object({
  key: Joi.string().trim().required().messages({
    'string.base': `Value should be a type of 'string'`,
    'any.required': `Value cannot be empty`,
  }),
  value: Joi.number().required().messages({
    'string.base': `Amount should be a type of 'string'`,
    'any.required': `amount cannot be empty`,
  }),
});

export const configUpdateTruthyValidator = Joi.object({
  key: Joi.string().trim().required().messages({
    'string.base': `Value should be a type of 'string'`,
    'any.required': `Value cannot be empty`,
  }),
  value: Joi.boolean().required().messages({
    'string.base': `Value should be a type of 'boolean'`,
    'any.required': `Value cannot be empty`,
  }),
});