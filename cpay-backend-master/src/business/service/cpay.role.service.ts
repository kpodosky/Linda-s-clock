import { BaseService } from '@app/lib/db/db.service';
import { ModelCtor } from 'sequelize-typescript';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CpayUserRole } from '../model/cpay.user.role.model';
import { CpayRole } from '../model/cpay.role.model';
import { roleFilterDto } from '../dto/cpay.business.dto';

@Injectable()
export class CpayRoleService extends BaseService<CpayRole> {
  constructor(
    @InjectModel(CpayRole)
    private readonly cpayRoleModel: ModelCtor<CpayRole>,
  ) {
    super(cpayRoleModel);
  }

  initialize = (data: any) => {
    return new CpayRole(data);
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
