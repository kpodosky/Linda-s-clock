import { passwordPattern } from '@app/lib/schema/password.schema';
import * as Joi from 'joi';

export const registrationValidator = Joi.object().keys({
  firstName: Joi.string().required().messages({
    'string.base': `First name should be a type of string`,
    'any.required': `First name field cannot be empty`,
  }),
  lastName: Joi.string().required().messages({
    'string.base': `Last name should be a type of string`,
    'any.required': `Last name field cannot be empty`,
  }),

  email: Joi.string().email().lowercase().trim().required().messages({
    'string.base': `Email should be a type of email`,
    'any.required': `Email field cannot be empty`,
  }),

  password: Joi.string()
    .pattern(new RegExp(passwordPattern))
    .trim()
    .required()
    .messages({
      'string.pattern.base': `Password should have at lease 8 characters, numbers and special characters`,
      'string.base': `Password should be a type of 'text'`,
      'any.required': `Password cannot be empty`,
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .trim()
    .required()
    .messages({
      'string.base': `Comfirm password should be a type of 'text'`,
      'any.required': `Comfirm password cannot be empty`,
      'any.only': 'Confirm password must be equal to password',
    }),
});

export const userEmailValidator = Joi.object().keys({
  code: Joi.string().trim().required().messages({
    'string.base': `Confirmation code should be a type of 'string'`,
    'any.required': `Confirmation code field cannot be empty`,
  }),
});

export const loginValidator = Joi.object().keys({
  email: Joi.string().lowercase().trim().required().messages({
    'string.base': `Email should be a type of 'email'`,
    'any.required': `Email field cannot be empty`,
  }),

  password: Joi.string().trim().required().messages({
    'string.base': `Password should be a type of 'text'`,
    'any.required': `Password cannot be empty`,
  }),
});

export const passwordResetValidator = Joi.object().keys({
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.base': `Email should be a type of email`,
    'any.required': `Email field cannot be empty`,
  }),
});

export const resendEmailVerificationValidator = Joi.object().keys({
  userId: Joi.string().trim().required().messages({
    'string.base': `User id should be a type of string`,
    'any.required': `User id field cannot be empty`,
  }),
});

export const passwordResetCodeValidator = Joi.object().keys({
  userId: Joi.string().trim().required().messages({
    'string.base': `User id should be a type of string`,
    'any.required': `User id field cannot be empty`,
  }),

  code: Joi.string().min(5).trim().required().messages({
    'string.base': `OTP should be a type of number`,
    'any.required': `OTP field cannot be empty`,
  }),
});

export const emailVerificationCodeValidator = Joi.object().keys({
  code: Joi.string().min(5).trim().required().messages({
    'string.base': `OTP should be a type of number`,
    'any.required': `OTP field cannot be empty`,
  }),
});

export const passwordUpdateVaildator = Joi.object().keys({
  userId: Joi.string().trim().required().messages({
    'string.base': `User id should be a type of email`,
    'any.required': `User id field cannot be empty`,
  }),

  password: Joi.string()
    .pattern(new RegExp(passwordPattern))
    .trim()
    .required()
    .messages({
      'string.pattern.base': `Password should have at lease 8 characters, numbers and special characters`,
      'string.base': `Password should be a type of 'text'`,
      'any.required': `Password cannot be empty`,
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .trim()
    .required()
    .messages({
      'string.base': `Comfirm password should be a type of 'text'`,
      'any.required': `Comfirm password cannot be empty`,
      'any.only': 'Confirm password must be equal to password',
    }),
});

export const inAppPasswordUpdateValidator = Joi.object().keys({
  oldPassword: Joi.string().trim().required().messages({
    'string.base': `User id should be a type of email`,
    'any.required': `User id field cannot be empty`,
  }),

  password: Joi.string()
    .pattern(new RegExp(passwordPattern))
    .trim()
    .required()
    .messages({
      'string.pattern.base': `Password should have at lease 8 characters, numbers and special characters`,
      'string.base': `Password should be a type of 'text'`,
      'any.required': `Password cannot be empty`,
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .trim()
    .required()
    .messages({
      'string.base': `Comfirm password should be a type of 'text'`,
      'any.required': `Comfirm password cannot be empty`,
      'any.only': 'Confirm password must be equal to password',
    }),
});

export const qrCodeVerificationValidator = Joi.object().keys({
  code: Joi.string().trim().required().messages({
    'string.base': `OTP should be a type of string`,
    'any.required': `OTP field cannot be empty`,
  }),
});
