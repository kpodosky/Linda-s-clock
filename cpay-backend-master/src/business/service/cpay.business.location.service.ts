import { BaseService } from '@app/lib/db/db.service';
import { ModelCtor } from 'sequelize-typescript';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import {
  BusinessLocationFilterDto,
  BusinessLocationUpdateDto,
} from '../dto/cpay.business.dto';
import { CpayBusinessLocation } from '../model/cpay.business.location.model';

@Injectable()
export class CpayBusinessLocationService extends BaseService<CpayBusinessLocation> {
  constructor(
    @InjectModel(CpayBusinessLocation)
    private readonly cpayBusinessLocationModel: ModelCtor<CpayBusinessLocation>,
  ) {
    super(cpayBusinessLocationModel);
  }

  initialize = (data: BusinessLocationUpdateDto) => {
    return new CpayBusinessLocation(data);
  };

  search = async (query: BusinessLocationFilterDto) => {
    const where: any = {};
    const options: any = { page: query.page, limit: query.limit, where };

    if (query.locationId) {
      where.id = query.locationId;
    }

    const searchdata = query.search
      ? {
          [Op.or]: [
            {
              customerId: {
                [Op.like]: `%${query.search}%`,
              },
            },
            {
              status: {
                [Op.like]: `%${query.search}%`,
              },
            },
          ],
        }
      : null;
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
