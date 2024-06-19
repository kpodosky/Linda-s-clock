import { paginationValidator } from '@app/lib/validator/paginate.validator';
import * as Joi from 'joi';

export const BusinessActivitiesFilterValidator = paginationValidator.append({
  businessId: Joi.string().trim().required(),
  memberId: Joi.string().trim().optional().allow(''),
  action: Joi.string().trim().optional().allow(''),
});

export const BusinessActivitiesUpdateValidator = Joi.object({
  activityId: Joi.string().trim().optional().allow(''),
});
