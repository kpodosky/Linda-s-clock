import { Injectable } from '@nestjs/common';
import { Rate } from '../model/rate.model';
import { BaseService } from '@app/lib/db/db.service';
import { ModelCtor } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { RateCreateDto, RateFilterDto } from '../dto/rate.dto';
import { Op } from 'sequelize';

@Injectable()
export class RateService extends BaseService<Rate> {
  constructor(
    @InjectModel(Rate)
    private readonly rateModel: ModelCtor<Rate>,
  ) {
    super(rateModel);
  }

  initialize = (data: RateCreateDto) => {
    return new Rate(data);
  };

  search = async (query: RateFilterDto) => {
    const where: any = {};
    const options: any = { page: query.page, limit: query.limit, where };

    if (query.active) {
      where.active = query.active;
    }

    const searchdata = query.search ? {} : null;
    if (query.startDate) {
      where.createdAt = {
        ...where.createdAt,
        [Op.gte]: query.startDate,
      };
    }

    if (query.endDate) {
      where.createdAt = {
        ...where.createdAt,
        [Op.lte]: query.endDate,
      };
    }
    options.where = { ...where, ...searchdata };
    options.order = [['createdAt', 'DESC']];

    return await this.paginatedResult(options);
  };
}
