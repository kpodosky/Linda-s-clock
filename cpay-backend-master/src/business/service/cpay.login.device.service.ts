import { BaseService } from '@app/lib/db/db.service';
import { ModelCtor } from 'sequelize-typescript';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { roleFilterDto } from '../dto/cpay.business.dto';
import { LoginDevice } from '../model/cpay.business.login.device.model';

@Injectable()
export class CpayLoginDeviceService extends BaseService<LoginDevice> {
  constructor(
    @InjectModel(LoginDevice)
    private readonly loginDeviceModel: ModelCtor<LoginDevice>,
  ) {
    super(loginDeviceModel);
  }

  initialize = (data: any) => {
    return new LoginDevice(data);
  };

  search = async (query: roleFilterDto) => {
    const where: any = {};
    const options: any = { page: query.page, limit: query.limit, where };

    if (query.roleId) {
      where.id = query.roleId;
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
