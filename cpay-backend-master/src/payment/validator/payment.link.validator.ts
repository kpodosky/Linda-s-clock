import { paginationValidator } from '@app/lib/validator/paginate.validator';
import * as Joi from 'joi';
import { PaymentLinkStatusEnum } from '../enum/payment.link.enum';
import { phoneNumberValidator } from '@app/lib/validator/phone.validator';
import { FiatWalletCurrencyEnum } from 'src/wallet/enum/wallet.enum';

export const initiateCryptoWalletDepositPaymentLink = Joi.object({
  title: Joi.string().required().messages({
    'string.base': `Payment title should be a type of string`,
    'any.required': `Payment title field cannot be empty`,
  }),
  description: Joi.string().required().messages({
    'string.base': `Payment title should be a type of string`,
    'any.required': `Payment title field cannot be empty`,
  }),
  amount: Joi.number().when('variableAmount', {
    is: Joi.boolean().valid(false),
    then: Joi.required().messages({
      'string.base': `Crypto value should be a type of number`,
      'any.required': `Crypto value field cannot be empty`,
    }),
    otherwise: Joi.optional(),
  }),
  currency: Joi.string()
    .valid(...Object.values(FiatWalletCurrencyEnum))
    .required(),
  coinId: Joi.string().required(),
  // networkId: Joi.string().required(),
  variableAmount: Joi.boolean().optional().default(false),
  redirectUrl: Joi.string().trim().optional().allow('').messages({
    'string.base': `Redirect URL should be a type of string`,
    'any.required': `Redirect URL field cannot be empty`,
  }),
  url: Joi.string().trim().required().messages({
    'string.base': `URL should be a type of string`,
    'any.required': `URL field cannot be empty`,
  }),
  businessId: Joi.string().trim().required().messages({
    'string.base': `Business id should be a type of string`,
    'any.required': `Business id field cannot be empty`,
  }),
});

export const updateWalletDepositPaymentLink = Joi.object({
  paymentLinkId: Joi.string().required().messages({
    'string.base': `Payment link id should be a type of string`,
    'any.required': `Payment link id field cannot be empty`,
  }),
  title: Joi.string().optional().allow('').messages({
    'string.base': `Payment title should be a type of string`,
    'any.required': `Payment title field cannot be empty`,
  }),
  description: Joi.string().optional().allow('').messages({
    'string.base': `Payment title should be a type of string`,
    'any.required': `Payment title field cannot be empty`,
  }),
  amount: Joi.number().when('variableAmount', {
    is: Joi.boolean().valid(false),
    then: Joi.optional().allow('').messages({
      'string.base': `Crypto value should be a type of number`,
      'any.required': `Crypto value field cannot be empty`,
    }),
    otherwise: Joi.optional(),
  }),
  currency: Joi.string()
    .valid(...Object.values(FiatWalletCurrencyEnum))
    .required(),
  coinId: Joi.string().optional().allow(''),
  networkId: Joi.string().optional().allow(''),
  variableAmount: Joi.boolean().optional().default(false),
  redirectUrl: Joi.string().trim().optional().allow('').messages({
    'string.base': `Asset id should be a type of string`,
    'any.required': `Asset id field cannot be empty`,
  }),
  url: Joi.string().trim().optional().allow('').messages({
    'string.base': `URL should be a type of string`,
    'any.required': `URL field cannot be empty`,
  }),
  businessId: Joi.string().trim().optional().allow('').messages({
    'string.base': `Business id should be a type of string`,
    'any.required': `Business id field cannot be empty`,
  }),
});

export const PaymentLinkValidator = paginationValidator.append({
  title: Joi.string().trim().optional(),
  businessId: Joi.string().trim().required(),
  url: Joi.string().trim().optional(),
  paymentLinkId: Joi.string().trim().optional(),
  active: Joi.boolean().allow('').optional(),
});

export const SinglePaymentLinkValidator = paginationValidator.append({
  businessId: Joi.string().trim().required(),
  paymentLinkId: Joi.string().trim().required(),
});

export const AdminPaymentLinkValidator = paginationValidator.append({
  title: Joi.string().trim().optional().allow(''),
  businessId: Joi.string().trim().optional().allow(''),
  url: Joi.string().trim().optional().allow(''),
  active: Joi.boolean().allow('').optional().allow(''),
});

export const retrieveStringPaymentLink = Joi.object({
  url: Joi.string().trim().required().messages({
    'string.base': `URL should be a type of string`,
    'any.required': `URL field cannot be empty`,
  }),
});

export const enableAndDisablePaymentLink = Joi.object({
  paymentLinkId: Joi.string().trim().required().messages({
    'string.base': `Payment link id should be a type of string`,
    'any.required': `Payment link id field cannot be empty`,
  }),
  status: Joi.string()
    .valid(...Object.values(PaymentLinkStatusEnum))
    .allow('')
    .optional(),
});

export const businessCustomerCreateTransactionValidator = Joi.object({
  firstName: Joi.string().required().messages({
    'string.base': `Full name should be a type of string`,
    'any.required': `Full name cannot be empty`,
  }),
  lastName: Joi.string().required().messages({
    'string.base': `Full name should be a type of string`,
    'any.required': `Full name cannot be empty`,
  }),
  email: Joi.string().email().trim().lowercase().required().messages({
    'string.base': `Email should be a type of string`,
    'any.required': `Email field cannot be empty`,
  }),
  networkId: Joi.string().required().messages({
    'string.base': `Network should be a type of string`,
    'any.required': `Network field cannot be empty`,
  }),
  paymentLinkId: Joi.string().required().messages({
    'string.base': `Payment link id should be a type of string`,
    'any.required': `Payment link id field cannot be empty`,
  }),
  phoneNumber: phoneNumberValidator.optional().allow(''),
});
