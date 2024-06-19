import { FindAndCountOptions } from 'sequelize';
import { Model } from 'sequelize-typescript';

export type PaginationOptionsDto<T extends Model> = FindAndCountOptions<T> & {
  page?: number;
  limit?: number;
  search: string;
  startDate: Date;
  endDate: Date;
};

export class PaginationDto {
  limit: number;
  page: number;
  search: string;
  startDate: Date;
  endDate: Date;
}
