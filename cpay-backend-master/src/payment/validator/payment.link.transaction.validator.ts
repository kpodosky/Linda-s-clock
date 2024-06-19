import { paginationValidator } from '@app/lib/validator/paginate.validator';
import * as Joi from 'joi';
import { TransactionStatusEnum } from 'src/transaction/enums/transaction.enum';

export const PaymentLinkTransactionValidator = paginationValidator.append({
  paymentLinkId: Joi.string().trim().optional().allow(''),
  businessId: Joi.string().trim().required(),
  currency: Joi.string().trim().optional().allow(''),
  reference: Joi.string().trim().optional().allow(''),
  senderid: Joi.string().trim().optional().allow(''),
  status: Joi.string()
    .valid(...Object.values(TransactionStatusEnum))
    .allow('')
    .optional()
    .allow(''),
});
