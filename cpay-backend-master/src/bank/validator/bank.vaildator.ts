import { paginationValidator } from '@app/lib/validator/paginate.validator';
import * as Joi from 'joi';
import {
  FiatWalletCurrencyEnum,
  WalletCurrencyEnum,
} from 'src/wallet/enum/wallet.enum';

export const addBankAccountMetaValidator = Joi.object({
  accountType: Joi.string().required(),
  routingNumber: Joi.string().required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().required(),
  postalCode: Joi.string().required(),
});

export const addBankAccountValidator = Joi.object({
  businessId: Joi.string().required(),
  accountName: Joi.string().required(),
  accountNumber: Joi.string().required(),
  bankCode: Joi.string().required(),
  bankName: Joi.string().required(),
  currency: Joi.string()
    .trim()
    .valid(...Object.values(FiatWalletCurrencyEnum))
    .required(),
  meta: Joi.when('currency', {
    is: WalletCurrencyEnum.USD,
    then: addBankAccountMetaValidator.required(),
    otherwise: addBankAccountMetaValidator.optional(),
  }),
});

export const addBankQueryValidator = paginationValidator.append({
  businessId: Joi.string().required(),
  accountName: Joi.string().trim(),
  accountNumber: Joi.string().trim(),
  bankCode: Joi.string().trim(),
  bankName: Joi.string().trim(),
  currency: Joi.string()
    .trim()
    .valid(...Object.values(WalletCurrencyEnum)),
});

export const removeBankAccountValidator = Joi.object({
  bankAccountId: Joi.string().required(),
});

export const supportedBanksQueryValidator = paginationValidator.append({
  businessId: Joi.string().required(),
  currency: Joi.string()
    .valid(...Object.values(WalletCurrencyEnum))
    .optional()
    .allow(''),
});

export const supportedBanksValidator = paginationValidator.append({
  currency: Joi.string()
    .valid(...Object.values(WalletCurrencyEnum))
    .optional()
    .allow(''),
});

export const verifyBankValidator = Joi.object().keys({
  bankCode: Joi.string().trim().required().messages({
    'string.base': `Bank code should be a type of 'text'`,
    'any.required': `Bank code cannot be empty`,
  }),

  accountNumber: Joi.string().trim().required().messages({
    'string.base': `Account number should be a type of 'text'`,
    'any.required': `Account number cannot be empty`,
  }),
});
