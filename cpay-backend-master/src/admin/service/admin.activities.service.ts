import { ModelCtor } from 'sequelize-typescript';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { BaseService } from '@app/lib/db/db.service';
import { AdminActivity } from '../model/activity.modal';
import {
  AdminFilterActivityDto,
  CreateAdminActivityDto,
} from '../dto/admin.activity.dto';
import { Admin } from '../model/admin.model';

@Injectable()
export class AdminActivityService extends BaseService<AdminActivity> {
  constructor(
    @InjectModel(AdminActivity)
    private readonly adminActivityModel: ModelCtor<AdminActivity>,
  ) {
    super(adminActivityModel);
  }

  initialize = (data: CreateAdminActivityDto) => {
    return new AdminActivity(data);
  };

  search = async (query: AdminFilterActivityDto) => {
    const where: any = {};
    const options: any = { page: query.page, limit: query.limit, where };

    if (query.adminId) {
      where.adminId = query.adminId;
    }
    if (query.action) {
      where.type = query.action;
    }

    const searchdata = query.search
      ? {
          [Op.or]: [
            {
              description: {
                [Op.like]: `%${query.search}%`,
              },
            },
            {
              action: {
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
    options.include = [
      {
        model: Admin,
        as: 'admin',
        attributes: ['id', 'fullName', 'profilePicture', 'email'],
      },
    ];
    options.order = [['createdAt', 'DESC']];

    return await this.paginatedResult(options);
  };
}
