import * as Joi from 'joi';
import { OtpTypeEnum } from '../enums/otp.enum';

export const otpValidator = Joi.object({
  code: Joi.number().required(),
  id: Joi.string().trim().required(),
  receiver: Joi.string().trim().required(),
  type: Joi.string()
    .trim()
    .valid(...Object.values(OtpTypeEnum))
    .required(),
});
