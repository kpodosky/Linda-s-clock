import { passwordValidator } from '@app/lib/function/string.function';
import * as Joi from 'joi';
// import { BusinessAccountModeEnum } from '../enum/business.enum';
import { phoneNumberValidator } from '@app/lib/validator/phone.validator';
import { BussinessAccountStatus } from '../dto/cpay.user.dto';

export const BusinessAccounRegistrationValidator = Joi.object().keys({
  businessName: Joi.string().trim().required().messages({
    'string.base': `Business name should be a type of string`,
    'any.required': `Business name field cannot be empty`,
  }),

  email: Joi.string().email().trim().lowercase().optional().allow('').messages({
    'string.base': `Email should be a type of string`,
    'any.required': `Email field cannot be empty`,
  }),

  password: Joi.string()
    .pattern(new RegExp(passwordValidator))
    .trim()
    .required()
    .messages({
      'string.pattern.base': `Password should have at lease 8 characters, numbers and special characters`,
      'string.base': `Password should be a type of 'text'`,
      'any.required': `Password cannot be empty`,
    }),
});

export const BusinessMemberLoginValidator = Joi.object().keys({
  email: Joi.string().trim().lowercase().required().messages({
    'string.base': `Email should be a type of 'string'`,
    'any.required': `Email cannot be empty`,
  }),

  password: Joi.string().trim().required().messages({
    'string.base': `Password should be a type of 'text'`,
    'any.required': `Password cannot be empty`,
  }),
});

export const BusinessMemberPasswordResetValidator = Joi.object().keys({
  email: Joi.string().email().lowercase().trim().optional().messages({
    'string.base': `Email should be a type of email`,
    'any.required': `Email field cannot be empty`,
  }),
});

export const BusinessMemberPasswordResetCodeValidator = Joi.object().keys({
  memberId: Joi.string().trim().required().messages({
    'string.base': `Member id should be a ftype of string`,
    'any.required': `Member id field cannot be empty`,
  }),

  code: Joi.string().min(5).trim().required().messages({
    'string.base': `OPT should be a type of number`,
    'any.required': `OPT field cannot be empty`,
  }),
});

export const BusinessMemberPasswordUpdateVaildator = Joi.object().keys({
  memberId: Joi.string().trim().required().messages({
    'string.base': `Member id should be a type of email`,
    'any.required': `Member id field cannot be empty`,
  }),

  password: Joi.string()
    .pattern(new RegExp(passwordValidator))
    .trim()
    .required()
    .messages({
      'string.pattern.base': `Password should have at lease 8 characters, numbers and special characters`,
      'string.base': `Password should be a type of 'text'`,
      'any.required': `Password cannot be empty`,
    }),

  confirmPassword: Joi.string()
    .pattern(new RegExp(passwordValidator))
    .trim()
    .required()
    .messages({
      'string.pattern.base': `Comfirm password should have at lease 8 characters, numbers and special characters`,
      'string.base': `Comfirm password should be a type of 'text'`,
      'any.required': `Comfirm password cannot be empty`,
    }),
});

export const BusinessMemberKeyGenerationValidator = Joi.object().keys({
  mode: Joi.string()
    .trim()
    // .valid(...Object.values(BusinessAccountModeEnum))
    .required(),
});

export const BusinessLocationUpdateValidator = Joi.object().keys({
  houseNo: Joi.string().trim().optional().trim().messages({
    'string.base': `House number should be a ftype of string`,
    'any.required': `House number field cannot be empty`,
  }),

  street: Joi.string().trim().optional().trim().messages({
    'string.base': `Street should be a type of number`,
    'any.required': `Street field cannot be empty`,
  }),

  city: Joi.string().trim().optional().trim().messages({
    'string.base': `City should be a type of number`,
    'any.required': `City field cannot be empty`,
  }),

  state: Joi.string().trim().optional().trim().messages({
    'string.base': `State should be a type of number`,
    'any.required': `State field cannot be empty`,
  }),

  country: Joi.string().trim().optional().trim().messages({
    'string.base': `Country should be a type of number`,
    'any.required': `Country field cannot be empty`,
  }),
});

export const BusinessInfoirmationUpdateValidator = Joi.object().keys({
  website: Joi.string().trim().optional().trim().messages({
    'string.base': `House number should be a ftype of string`,
    'any.required': `House number field cannot be empty`,
  }),

  industry: Joi.string().trim().optional().trim().messages({
    'string.base': `Street should be a type of number`,
    'any.required': `Street field cannot be empty`,
  }),

  category: Joi.string().trim().optional().trim().messages({
    'string.base': `City should be a type of number`,
    'any.required': `City field cannot be empty`,
  }),

  size: Joi.string().trim().optional().trim().messages({
    'string.base': `State should be a type of number`,
    'any.required': `State field cannot be empty`,
  }),

  description: Joi.string().optional().trim().messages({
    'string.base': `Country should be a type of number`,
    'any.required': `Country field cannot be empty`,
  }),
  phoneNumber: phoneNumberValidator.optional().allow(''),
});

export const BusinessMemberPersonalInformationUpdateValidator =
  Joi.object().keys({
    firstName: Joi.string().trim().optional().trim().messages({
      'string.base': `House number should be a ftype of string`,
      'any.required': `House number field cannot be empty`,
    }),

    lastName: Joi.string().trim().optional().trim().messages({
      'string.base': `Street should be a type of number`,
      'any.required': `Street field cannot be empty`,
    }),
  });

export const emailAccounVerificationValidator = Joi.object().keys({
  code: Joi.string().min(5).trim().required().messages({
    'string.base': `OPT should be a type of number`,
    'any.required': `OPT field cannot be empty`,
  }),
});

export const AdminUpdatedBusinessStatusValidator = Joi.object().keys({
  businessId: Joi.string().trim().required().messages({
    'string.base': `Business id should be a ftype of string`,
    'any.required': `Business id field cannot be empty`,
  }),

  businessStatus: Joi.string()
  .valid(...Object.values(BussinessAccountStatus))
  .required(),
});
