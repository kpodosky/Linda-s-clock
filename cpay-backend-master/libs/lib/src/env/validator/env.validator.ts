import * as Joi from 'joi';
import { BaseEnvConfig } from '../enum/env.enum';
// NOTE: THIS ARE STANDARD CONFIGS FOR THE UTILS LIBRARY
export const baseEnvValidator = Joi.object().keys({
  [BaseEnvConfig.PORT]: Joi.string().trim().required(),
  [BaseEnvConfig.POSTGRES_DB_HOST]: Joi.string().trim().required(),
  [BaseEnvConfig.POSTGRES_DB_PORT]: Joi.string().trim().required(),
  [BaseEnvConfig.POSTGRES_DB_USER]: Joi.string().trim().required(),
  [BaseEnvConfig.POSTGRES_DB_PASSWORD]: Joi.string().trim().required(),
  [BaseEnvConfig.POSTGRES_DB_NAME]: Joi.string().trim().required(),
});
