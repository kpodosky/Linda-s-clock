import { baseEnvValidator } from '@app/lib/env/validator/env.validator';
import { ConfigEnum, EnvNodeEnv } from './../enum/env.enum';
import * as Joi from 'joi';

// extend from the base needed in the library
export const envValidator = baseEnvValidator.append({
  [ConfigEnum.REFRESH_TOKEN_EXPIRATION_TIME]: Joi.string().required(),
  [ConfigEnum.NODE_ENV]: Joi.string()
    .valid(...Object.values(EnvNodeEnv))
    .required(),
  [ConfigEnum.SERVER_URL]: Joi.string().required(),
  [ConfigEnum.CLOUDINARY_API_SECRET]: Joi.string().required(),
  [ConfigEnum.CLOUDINARY_API_KEY]: Joi.string().required(),
  [ConfigEnum.CLOUDINARY_NAME]: Joi.string().required(),
  [ConfigEnum.THROTTLE_TTL]: Joi.number().required(),
  [ConfigEnum.THROTTLE_LIMIT]: Joi.number().required(),
  [ConfigEnum.FLUTTER_WAVE_SECRET_KEY]: Joi.string().required(),
  [ConfigEnum.FLUTTER_WAVE_ENCRYPTION_SECRET]: Joi.string().required(),
  [ConfigEnum.MAIL_GUN_SECRET_KEY]: Joi.string().required(),
  [ConfigEnum.ADMIN_DASHBOARD_URL]: Joi.string().required(),
});
