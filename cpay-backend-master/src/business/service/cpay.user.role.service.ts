import { BaseService } from '@app/lib/db/db.service';
import { ModelCtor } from 'sequelize-typescript';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CpayUserRole } from '../model/cpay.user.role.model';
import { CpayUser } from '../model/cpay.user.model';
import { CpayRole } from '../model/cpay.role.model';

@Injectable()
export class CypayUserRoleService extends BaseService<CpayUserRole> {
  constructor(
    @InjectModel(CpayUserRole)
    private readonly cpayUserRoleModel: ModelCtor<CpayUserRole>,
  ) {
    super(cpayUserRoleModel);
  }

  initialize = (data: any) => {
    return new CpayUserRole(data);
  };

  search = async (query: any) => {
    const where: any = {};
    const options: any = { page: query.page, limit: query.limit, where };

    if (query.businessId) {
      where.businessId = query.businessId;
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
    options.attributes = {
      ...options.attributes,
      exclude: ['userId', 'roleId'],
    };
    options.where = { ...where, ...searchdata };
    options.order = [['createdAt', 'DESC']];
    options.include = [
      {
        model: CpayUser,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture'],
      },
      {
        model: CpayRole,
        as: 'role',
        attributes: ['id', 'title', 'active'],
      },
    ];


    return await this.paginatedResult(options);
  };
}
