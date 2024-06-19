import * as Joi from 'joi';
import { WalletCurrencyEnum } from 'src/wallet/enum/wallet.enum';
import {
  NetworkCode,
  TransactionCategoryEnum,
  TransactionStatusEnum,
  TransactionTypeEnum,
  WithdrawalRequestsEnum,
} from '../enums/transaction.enum';
import { paginationValidator } from '@app/lib/validator/paginate.validator';
import { ClockPayGraphTypeEnum } from '@app/lib/enum/login.enum';

export const transactionCreateValidaotr = Joi.object({
  currency: Joi.string()
    .trim()
    .valid(...Object.values(WalletCurrencyEnum))
    .required(),
  amount: Joi.number().required(),
  description: Joi.string(),
});

export const TransactionFilterValidator = paginationValidator.append({
  businessId: Joi.array()
    .items(Joi.string().trim().optional())
    .min(0)
    .default(null),
  reference: Joi.array()
    .items(Joi.string().trim().optional())
    .min(0)
    .default(null),
  providerReference: Joi.array()
    .items(Joi.string().trim().optional())
    .min(0)
    .default(null),
  status: Joi.array()
    .items(
      Joi.string()
        .valid(...Object.values(TransactionStatusEnum))
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
  type: Joi.array()
    .items(
      Joi.string()
        .valid(...Object.values(TransactionTypeEnum))
        .allow('')
        .optional(),
    )
    .default(null),
});

export const cryptoTransactionVerificationValidator = Joi.object({
  trxHash: Joi.string().trim().required(),
  reference: Joi.string().trim().required(),
  code: Joi.string()
    .valid(...Object.values(NetworkCode))
    .required(),
});

export const transactionVerificationValidator = Joi.object({
  event: Joi.string().trim().required(),
  data: Joi.object().required(),
});

export const transactionVerificationCodeValidator = Joi.object({
  code: Joi.string().trim().required(),
});

export const webhookTransactionValidator = Joi.object().keys({
  event: Joi.string().trim().required().messages({
    'string.base': `Request id should be a type of 'string'`,
    'any.required': `Request id cannot be empty`,
  }),
  data: Joi.object().required().messages({
    'string.base': `Request id should be a type of 'string'`,
    'any.required': `Request id cannot be empty`,
  }),
});

export const BusinessTransactionFilterValidator = paginationValidator.append({
  businessId: Joi.string().trim().required(),
  walletId: Joi.string().trim().optional().allow(''),
  reference: Joi.string().trim().optional().allow(''),
  providerReference: Joi.string().trim().optional().allow(''),
  status: Joi.string()
    .valid(...Object.values(TransactionStatusEnum))
    .allow('')
    .optional(),
  currency: Joi.string()
    .valid(...Object.values(WalletCurrencyEnum))
    .allow('')
    .optional(),
  type: Joi.string()
    .valid(...Object.values(TransactionTypeEnum))
    .allow('')
    .optional(),
  category: Joi.string()
    .valid(...Object.values(TransactionCategoryEnum))
    .allow('')
    .optional(),
});
export const AdminTransactionFilterValidator = paginationValidator.append({
  transactionId: Joi.string().trim().optional(),
  businessId: Joi.string().trim().optional(),
  paymentLinkId: Joi.string().trim().optional(),
  trxRef: Joi.string().trim().optional(),
  currency: Joi.string()
    .valid(...Object.values(WalletCurrencyEnum))
    .allow('')
    .optional(),
  type: Joi.string()
    .valid(...Object.values(TransactionTypeEnum))
    .allow('')
    .optional(),
  status: Joi.string()
    .valid(...Object.values(TransactionStatusEnum))
    .allow('')
    .optional(),
  category: Joi.string()
    .valid(...Object.values(TransactionCategoryEnum))
    .allow('')
    .optional(),
});

export const BusinessTransactionGraphFilterValidator =
  paginationValidator.append({
    businessId: Joi.string().trim().required(),
    period: Joi.string()
      .valid(...Object.values(ClockPayGraphTypeEnum))
      .required(),
  });

export const AdminUpdateWithdrawalValidator = Joi.object({
  status: Joi.string()
    .valid(...Object.values(WithdrawalRequestsEnum))
    .required(),
  reason: Joi.when('status', {
    is: WithdrawalRequestsEnum.declined,
    then: Joi.string().required(),
    otherwise: Joi.string().optional().allow(''),
  }),
});

export const withdrawalRequestFilterValidator = paginationValidator.append({
  transactionId: Joi.string().trim().optional().allow(null).messages({
    'string.base': `Request id should be a type of 'string'`,
    'any.required': `Request id cannot be empty`,
  }),
  businessId: Joi.string().trim().optional().allow(null).messages({
    'string.base': `Request id should be a type of 'string'`,
    'any.required': `Request id cannot be empty`,
  }),
  status: Joi.string().trim().optional().allow(null).messages({
    'string.base': `Request id should be a type of 'string'`,
    'any.required': `Request id cannot be empty`,
  }),
  name: Joi.string().trim().optional().allow(null).messages({
    'string.base': `Request id should be a type of 'string'`,
    'any.required': `Request id cannot be empty`,
  }),
  currency: Joi.string().trim().optional().allow(null).messages({
    'string.base': `Request id should be a type of 'string'`,
    'any.required': `Request id cannot be empty`,
  }),
  reference: Joi.string().trim().optional().allow(null).messages({
    'string.base': `Request id should be a type of 'string'`,
    'any.required': `Request id cannot be empty`,
  }),
});
