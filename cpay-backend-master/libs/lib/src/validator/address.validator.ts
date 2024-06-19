import * as Joi from 'joi';
import { coordinatesValidator } from './coordinate.validator';
import { AddressSchema } from '../schema/address.schema';

export const addressValidator = coordinatesValidator
  .append({
    address: Joi.string().trim().required(),
    country: Joi.string().trim().required(),
    state: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
  })
  .custom((value: AddressSchema) => {
    if (!value.coordinates) {
      value.coordinates = [0, 0];
      value.type = 'Point';
      return value;
    }
    return value;
  });

export const addressTwoValidator = coordinatesValidator
  .append({
    address: Joi.string().trim().optional().allow(''),
    country: Joi.string().trim().optional().allow(''),
    state: Joi.string().trim().optional().allow(''),
    city: Joi.string().trim().optional().allow(''),
    iso2: Joi.string().trim().optional().allow(''),
    iso3: Joi.string().trim().optional().allow(''),
  })
  .custom((value: AddressSchema) => {
    if (!value.coordinates) {
      value.coordinates = [0, 0];
      value.type = 'Point';
      return value;
    }
    return value;
  });
