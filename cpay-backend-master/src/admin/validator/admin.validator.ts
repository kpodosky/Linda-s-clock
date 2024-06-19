import * as Joi from 'joi';
import { AdminAccountStatusEnum } from '../enum/admin.enum';
import { WalletCurrencyEnum } from 'src/wallet/enum/wallet.enum';
import { paginationValidator } from '@app/lib/validator/paginate.validator';
import { ClockPayGraphTypeEnum } from '@app/lib/enum/login.enum';
const re = /^(?=.*\d)(?=.*[!@#$%^&*,?.])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

export const adminDashboardFilterValidator = paginationValidator.append({
  currency: Joi.string()
    .trim()
    .valid(...Object.values(WalletCurrencyEnum))
    .optional()
    .allow(''),
});

export const adminFilterUserValidator = paginationValidator.append({
  userId: Joi.string().trim().optional().allow(''),
  email: Joi.string().lowercase().trim().optional().allow(''),
  firstName: Joi.string().trim().optional().allow(''),
  lastName: Joi.string().trim().optional().allow(''),
  username: Joi.string().trim().optional().allow(''),
  approvedBy: Joi.string().trim().optional().allow(''),
  freeze: Joi.boolean().optional().allow(''),
});

export const adminRoleFilterUserValidator = paginationValidator.append({
  title: Joi.string().trim().optional().allow(''),
  email: Joi.string().lowercase().trim().optional().allow(''),
  firstName: Joi.string().trim().optional().allow(''),
  lastName: Joi.string().trim().optional().allow(''),
  username: Joi.string().trim().optional().allow(''),
  approvedBy: Joi.string().trim().optional().allow(''),
  freeze: Joi.boolean().optional().allow(''),
});

export const adminJoinRequestValidator = Joi.object({
  fullName: Joi.string().lowercase().required(),
  email: Joi.string().lowercase().required(),
  roleId: Joi.string().required(),
});

export const removeAdminMemberValidator = Joi.object({
  memberId: Joi.string().lowercase().required(),
});

export const userBusinessTrendValidator = Joi.object({
  period: Joi.string()
    .valid(...Object.values(ClockPayGraphTypeEnum))
    .required(),
});

export const adminPasswordUpdateValidator = Joi.object({
  adminId: Joi.string().required(),
  password: Joi.string().pattern(new RegExp(re)).trim().required().messages({
    'string.pattern.base': `Password should have at lease 8 characters, numbers and special characters`,
    'string.base': `Password should be a type of 'text'`,
    'any.required': `Password cannot be empty`,
  }),

  confirmPassword: Joi.string()
    .trim()
    .required()
    .valid(Joi.ref('password')) // Ensure confirmPassword is equal to password
    .messages({
      'string.pattern.base':
        'Confirm password should have at least 8 characters, numbers, and special characters',
      'string.base': "Confirm password should be a type of 'text'",
      'any.required': 'Confirm password cannot be empty',
      'any.only': 'Confirm password must be equal to password',
    }),
});

export const editAdminProfileVaildator = Joi.object().keys({
  fullName: Joi.string().trim().optional().allow('').messages({
    'string.base': `User id should be a ftype of string`,
    'any.required': `User id field cannot be empty`,
  }),

  profilePicture: Joi.string().trim().optional().allow('').messages({
    'string.base': `User id should be a ftype of string`,
    'any.required': `User id field cannot be empty`,
  }),
});

export const AdminQueryValidator = paginationValidator.append({
  adminId: Joi.string().trim().optional(),
  customerId: Joi.string().trim().optional(),
  email: Joi.string().lowercase().trim().optional(),
  status: Joi.array().items(
    Joi.string()
      .valid(...Object.values(AdminAccountStatusEnum))
      .allow('')
      .optional(),
  ),
});

export const AdminLoginValidator = Joi.object({
  email: Joi.string().lowercase().trim().optional(),
  password: Joi.string().trim().optional(),
});

export const adminConfirmCodeValidator = Joi.object().keys({
  code: Joi.string().min(5).trim().required().messages({
    'string.base': `OTP should be a type of number`,
    'any.required': `OTP field cannot be empty`,
  }),
  adminId: Joi.string().trim().required().messages({
    'string.base': `Admin id should be a type of number`,
    'any.required': `Admin id field cannot be empty`,
  }),
});

export const adminGetUserWalletValidator = Joi.object({
  userId: Joi.string().required(),
});
