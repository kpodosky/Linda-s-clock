import * as Joi from 'joi';
import { dateValidator } from './date.validator';
import { PaginationDto } from '../dto/pagination.dto';

export const paginationValidator = Joi.object({
  limit: Joi.number().default(10),
  page: Joi.number().default(1),
  search: Joi.string().trim().default(''),
  startDate: dateValidator.default(null),
  endDate: dateValidator.default(null),
}).custom((value: PaginationDto) => {
  if (value?.startDate && value?.endDate) {
    const startDate = new Date(value.startDate);
    const endDate = new Date(value.endDate);
    if (startDate.getTime() === endDate.getTime()) {
      value.endDate.setUTCDate(value.endDate.getUTCDate() + 1);
    }
  }

  return value;
});
