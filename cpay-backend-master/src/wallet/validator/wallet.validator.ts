import * as Joi from 'joi';
import {
  FiatWalletCurrencyEnum,
  PaymentChannelEnum,
  WalletCategoryEnum,
  WalletCurrencyEnum,
  WalletStatusEnum,
} from '../enum/wallet.enum';
import { paginationValidator } from '@app/lib/validator/paginate.validator';
import { NetworkTagEnum } from '../enum/coin.enum';

export const WalletSearchValidator = paginationValidator.append({
  customerId: Joi.array()
    .items(Joi.string().trim().optional())
    .min(0)
    .default(null),
  businessId: Joi.string().trim().optional().allow(''),
  walletStatus: Joi.array()
    .items(
      Joi.string()
        .valid(...Object.values(WalletStatusEnum))
        .allow('')
        .optional(),
    )
    .min(0)
    .default(null),
  currency: Joi.array()
    .items(
      Joi.string()
        .valid(...Object.values(WalletCurrencyEnum))
        .allow('')
        .optional(),
    )
    .default(null),
});

export const WalletSumSearchValidator = paginationValidator.append({
  businessId: Joi.string().trim().required(),
  currency: Joi.string()
    .valid(...Object.values(FiatWalletCurrencyEnum))
    .required(),
});

export const BusinessWalletSearchValidator = paginationValidator.append({
  businessId: Joi.string().trim().required(),
  status: Joi.string()
    .valid(...Object.values(WalletStatusEnum))
    .allow('')
    .optional(),
  currency: Joi.string()
    .valid(...Object.values(WalletCurrencyEnum))
    .allow('')
    .optional(),
  category: Joi.string()
    .valid(...Object.values(WalletCategoryEnum))
    .allow('')
    .optional(),
});

const cardPaymentChannelValidator = Joi.object({
  cardNumber: Joi.string().trim().length(16).required(),
  cvv: Joi.string().trim().length(3).required(),
  expiryMonth: Joi.string().trim().length(2).required(),
  expiryYear: Joi.string().trim().length(2).required(),
});

export const AdminCoinNetworkNewValidator = Joi.object({
  address: Joi.string().trim().required(),
  networkId: Joi.string().trim().required(),
});

export const AdminBusinessNetworkNewValidator = Joi.object({
  walletId: Joi.string().trim().required(),
  coinId: Joi.string().trim().optional(),
  businessId: Joi.string().trim().required(),
});

export const AdminCreateWalletValidator = Joi.object({
  tag: Joi.string()
    .valid(...Object.values(NetworkTagEnum))
    .required(),
  coinId: Joi.string().trim().required(),
  businessId: Joi.string().trim().required(),
  address: Joi.string().trim().required(),
});

export const AdminUpdateWalletParamValidator = Joi.object({
  walletId: Joi.string().trim().required(),
});

export const AdminUpdateWithdrawalRequestParamValidator = Joi.object({
  requestId: Joi.string().trim().required(),
});

export const AdminUpdateWalletValidator = Joi.object({
  address: Joi.string().trim().required(),
  tag: Joi.string()
    .valid(...Object.values(NetworkTagEnum))
    .required(),
});

export const enableAndDisableWalletValidator = Joi.object({
  status: Joi.boolean().required(),
  currency: Joi.string()
    .valid(...Object.values(WalletCurrencyEnum))
    .required(),
});

export const addCryptoWalletValidator = Joi.object({
  assetId: Joi.string().trim().required().messages({
    'string.base': `Asset id should be a type of string`,
    'any.required': `Asset id field cannot be empty`,
  }),

  name: Joi.string().trim().required().messages({
    'string.base': `Asset name should be a type of string`,
    'any.required': `Asset name field cannot be empty`,
  }),
});

export const walletAdressValidator = Joi.object({
  assetId: Joi.string().trim().required().messages({
    'string.base': `Asset id should be a type of string`,
    'any.required': `Asset id field cannot be empty`,
  }),

  address: Joi.string().trim().required().messages({
    'string.base': `Wallet address should be a type of string`,
    'any.required': `Wallet address field cannot be empty`,
  }),
});

export const initiateCryptoWalletDepositPaymentLink = Joi.object({
  page: Joi.string().trim().required().messages({
    'string.base': `Payment title should be a type of string`,
    'any.required': `Payment title field cannot be empty`,
  }),

  description: Joi.string().trim().required().messages({
    'string.base': `Payment title should be a type of string`,
    'any.required': `Payment title field cannot be empty`,
  }),

  amount: Joi.number().required().messages({
    'string.base': `Crypto value should be a type of string`,
    'any.required': `Crypto value field cannot be empty`,
  }),

  walletId: Joi.string().trim().required().messages({
    'string.base': `Wallet id should be a type of string`,
    'any.required': `Wallet id field cannot be empty`,
  }),

  assetId: Joi.string().trim().required().messages({
    'string.base': `Asset id should be a type of string`,
    'any.required': `Asset id field cannot be empty`,
  }),
});

export const initiateCryptoWalletDeposit = Joi.object({
  page: Joi.string().trim().required().messages({
    'string.base': `Payment title should be a type of string`,
    'any.required': `Payment title field cannot be empty`,
  }),

  description: Joi.string().trim().required().messages({
    'string.base': `Payment title should be a type of string`,
    'any.required': `Payment title field cannot be empty`,
  }),

  amount: Joi.number().required().messages({
    'string.base': `Crypto value should be a type of string`,
    'any.required': `Crypto value field cannot be empty`,
  }),

  walletId: Joi.string().trim().required().messages({
    'string.base': `Wallet id should be a type of string`,
    'any.required': `Wallet id field cannot be empty`,
  }),

  assetId: Joi.string().trim().required().messages({
    'string.base': `Asset id should be a type of string`,
    'any.required': `Asset id field cannot be empty`,
  }),
});

export const walletWithdrawalValidator = Joi.object({
  businessId: Joi.string().trim().required().messages({
    'string.base': `Business id should be a type of string`,
    'any.required': `Business id field cannot be empty`,
  }),

  walletId: Joi.string().trim().required().messages({
    'string.base': `Wallet id should be a type of string`,
    'any.required': `Wallet id field cannot be empty`,
  }),

  amount: Joi.number().min(0).required().messages({
    'string.base': `Amount should be a type of number`,
    'any.required': `Amount field cannot be empty`,
  }),

  bankId: Joi.string().trim().required().messages({
    'string.base': `Bank id should be a type of string`,
    'any.required': `Bank id field cannot be empty`,
  }),

  currency: Joi.string()
    .valid(...Object.values(FiatWalletCurrencyEnum))
    .required(),
});

export const BusinessSetAcceptedCurrencyValidator = Joi.object({
  walletId: Joi.string().trim().required(),
});
