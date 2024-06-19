import * as Joi from 'joi';

export const coordinatesValidator = Joi.object({
  type: Joi.string().trim().valid('Point').default('Point'),
  coordinates: Joi.array()
    .items(Joi.number())
    // .required()
    .allow(null)
    .custom((value: number[], helpers) => {
      const [lng, lat] = value;
      if (!lng || !lng) {
        return helpers.message({
          '*': 'invalid longitude or laitude provided',
        });
      }

      if (lng < -180 || lng > 180) {
        return helpers.message({ '*': 'invalid longitude provided' });
      }
      if (lat < -90 || lat > 90) {
        return helpers.message({ '*': 'invalid latitude provided' });
      }
      /** the validation on top already ensures that the values don't go beyond the required */
      const longPattern = /^([\d{+,-}]{1,})(.)([\d]{4,})$/;
      const latPattern = /^([\d{+,-}]{1,})(.)([\d]{4,})$/;

      /** allow 0 as empty latitude*/
      // if (!latPattern.test(`${lat}`) && lat !== 0) {
      //   return helpers.message({ '*': 'please provide a valid latitude' });
      // }

      /** allow 0 as empty longitude*/
      // if (!longPattern.test(`${lng}`) && lng !== 0) {
      //   return helpers.message({
      //     '*': 'please provide a valid longitude ',
      //   });
      // }

      return value;
    }),
});
