import { paginationValidator } from '@app/lib/validator/paginate.validator';
import { phoneNumberValidator } from '@app/lib/validator/phone.validator';
import * as Joi from 'joi';
import { PersonIdentityVerificationTypeEnum } from '../enum/business.enum';
import {
  addressTwoValidator,
  addressValidator,
} from '@app/lib/validator/address.validator';

export const createCpayBusinessValidator = Joi.object().keys({
  name: Joi.string().trim().required().messages({
    'string.base': `Name should be a type of 'email'`,
    'any.required': `Name field cannot be empty`,
  }),

  industry: Joi.string().trim().required().messages({
    'string.base': `Industry should be a type of 'text'`,
    'any.required': `Industry cannot be empty`,
  }),

  email: Joi.string().trim().trim().required().messages({
    'string.base': `Business email should be a type of 'text'`,
    'any.required': `Business email cannot be empty`,
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

export const BusinessFilterValidator = paginationValidator.append({
  businessId: Joi.string().trim().optional().allow(''),
  status: Joi.string().trim().optional().allow(''),
  industry: Joi.string().trim().optional().allow(''),
  level: Joi.string().trim().optional().allow(''),
  profileCompleted: Joi.boolean().optional().allow(''),
  identityVerified: Joi.boolean().optional().allow(''),
  addressVerified: Joi.boolean().optional().allow(''),
});

export const BusinessRolesFilterValidator = paginationValidator.append({
  roleId: Joi.string().trim().optional().allow(''),
});

export const BusinessMemberFilterValidator = paginationValidator.append({
  businessId: Joi.string().trim().required(),
  roleId: Joi.string().trim().optional().allow(''),
});

export const AdminBusinessMemberFilterValidator = paginationValidator.append({
  businessId: Joi.string().trim().optional().allow(''),
  roleId: Joi.string().trim().optional().allow(''),
});

export const OwnerInviteMemberValidator = Joi.object().keys({
  roleId: Joi.string().trim().required(),
  businessId: Joi.string().trim().required(),
  email: Joi.string().lowercase().trim().required(),
});

export const OwnerRemoveMemberValidator = Joi.object().keys({
  businessId: Joi.string().trim().required(),
  userId: Joi.string().trim().required(),
});

export const UpdateBusinessLocationValidator = Joi.object().keys({
  businessId: Joi.string().required(),
  country: Joi.string().optional().allow(''),
  houseNo: Joi.string().optional().allow(''),
  address: Joi.string().optional().allow(''),
  state: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
});

export const UpdateBusinessProfileValidator = Joi.object().keys({
  businessId: Joi.string().required(),
  registrationNumber: Joi.string().trim().optional().allow(''),
  email: Joi.string().trim().optional().allow(''),
  website: Joi.string().trim().optional().allow(''),
  size: Joi.string().optional().allow(''),
  phoneNumber: phoneNumberValidator.optional().allow(''),
  description: Joi.string().optional().allow(''),
});

export const Update2FaValidator = Joi.object({
  key: Joi.string().trim().required().messages({
    'string.base': `Key should be a type of 'string'`,
    'any.required': `Key cannot be empty`,
  }),
});

export const UpdateBusinessStatusValidator = Joi.object({
  businessId: Joi.string().trim().required().messages({
    'string.base': `Business id should be a type of 'string'`,
    'any.required': `Business id cannot be empty`,
  }),
});

export const personalAccountDeletionValidator = Joi.object({
  reason: Joi.string().trim().required().messages({
    'string.base': `Reason should be a type of 'string'`,
    'any.required': `Reason cannot be empty`,
  }),
});

export const UpdatePersonalInformationValidator = Joi.object().keys({
  phoneNumber: phoneNumberValidator.optional().allow(''),
  type: Joi.string()
    .trim()
    .valid(...Object.values(PersonIdentityVerificationTypeEnum)),
  idNumber: Joi.string().optional().allow(''),
  firstName: Joi.string().optional().allow(''),
  lastName: Joi.string().optional().allow(''),
  address: addressTwoValidator.optional().allow(''),
});

export const UpdateBusinessInformationValidator = Joi.object().keys({
  businessId: Joi.string().required(),
  country: Joi.string().optional().allow(''),
  houseNo: Joi.string().optional().allow(''),
  address: Joi.string().optional().allow(''),
  state: Joi.string().optional().allow(''),
  email: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  registrationNumber: Joi.string().trim().optional().allow(''),
  website: Joi.string().trim().optional().allow(''),
  size: Joi.string().optional().allow(''),
  phoneNumber: phoneNumberValidator.optional().allow(''),
  description: Joi.string().optional().allow(''),
});
