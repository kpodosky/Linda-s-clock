import { paginationValidator } from '@app/lib/validator/paginate.validator';
import * as Joi from 'joi';

export const adminRoleCreateValidator = Joi.object({
  title: Joi.string().required(),
});

export const AdminRoleQueryValidator = paginationValidator.append({
  roleId: Joi.string().trim().optional().allow(''),
  title: Joi.string().trim().optional().allow(''),
  status: Joi.boolean().optional().allow(''),
});
