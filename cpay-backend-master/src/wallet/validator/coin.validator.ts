import { paginationValidator } from '@app/lib/validator/paginate.validator';
import * as Joi from 'joi';
import { NetworkTagEnum } from '../enum/coin.enum';

export const adminCreateCoinValidator = Joi.object({
  name: Joi.string().trim().required(),
  code: Joi.string().trim().required(),
});

export const adminUpdateCoinValidator = Joi.object({
  coinId: Joi.string().trim().required(),
  name: Joi.string().trim().optional().allow(''),
  code: Joi.string().trim().optional().allow(''),
});

export const coinSearchValidator = paginationValidator.append({
  coinId: Joi.string().trim().optional().allow(''),
  businessId: Joi.string().trim().optional().allow(''),
  code: Joi.string().trim().optional().allow(''),
});

export const adminCreateCoinWalletValidator = Joi.object({
  coinId: Joi.string().trim().required(),
  name: Joi.string().trim().required(),
  code: Joi.string().trim().required(),
  contractAddress: Joi.string().trim().required(),
  tag: Joi.string()
    .trim()
    .valid(...Object.values(NetworkTagEnum))
    .required(),
});

export const adminUpdateCoinNetworkValidator = Joi.object({
  networkId: Joi.string().trim().required(),
  coinId: Joi.string().trim().optional().allow(''),
  name: Joi.string().trim().optional().allow(''),
  code: Joi.string().trim().optional().allow(''),
  tag: Joi.string()
    .trim()
    .valid(...Object.values(NetworkTagEnum))
    .optional()
    .allow(''),
});

export const coinNetworkSearchValidator = paginationValidator.append({
  networkId: Joi.string().trim().optional().allow(''),
  coinId: Joi.string().trim().optional().allow(''),
  businessId: Joi.string().trim().optional().allow(''),
  code: Joi.string().trim().optional().allow(''),
});
