import { BaseService } from '@app/lib/db/db.service';
import { ModelCtor } from 'sequelize-typescript';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CpayBusinessCustomer } from '../model/cpay.business.customer.model';
import { CreateBusinessCustomerDto } from '../dto/cpay.business.customer.dto';

@Injectable()
export class CpayBusinessCustomerService extends BaseService<CpayBusinessCustomer> {
  constructor(
    @InjectModel(CpayBusinessCustomer)
    private readonly cpayBusinessCustomerModel: ModelCtor<CpayBusinessCustomer>,
  ) {
    super(cpayBusinessCustomerModel);
  }

  initialize = (data: CreateBusinessCustomerDto) => {
    return new CpayBusinessCustomer(data);
  };

  search = async (query: any) => {
    const where: any = {};
    const options: any = { page: query.page, limit: query.limit, where };

    if (query.businessId) {
      where.businessId = query.businessId;
    }
    if (query.customerId) {
      where.id = query.customerId;
    }
    if (query.status) {
      where.status = query.status;
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
