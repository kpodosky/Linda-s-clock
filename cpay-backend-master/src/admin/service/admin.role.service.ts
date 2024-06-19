import { ModelCtor } from 'sequelize-typescript';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { AddAdminRoleDto, AdminRoleFilterDto } from '../dto/admin.role.dto';
import { AdminRoles } from '../model/admin.role';
import { BaseService } from '@app/lib/db/db.service';

@Injectable()
export class AdminRoleService extends BaseService<AdminRoles> {
  constructor(
    @InjectModel(AdminRoles)
    private readonly adminRoleModel: ModelCtor<AdminRoles>,
  ) {
    super(adminRoleModel);
  }

  initialize = (data: AddAdminRoleDto) => {
    return new AdminRoles(data);
  };

  search = async (query: AdminRoleFilterDto) => {
    const where: any = {};
    const options: any = { page: query.page, limit: query.limit, where };

    if (query.roleId) {
      where.id = query.roleId;
    }
    if (query.title) {
      where.title = {
        [Op.iLike]: query.title,
      };
    }
    if (query.status) {
      where.status = query.status;
    }

    const searchdata = query.search
      ? {
          [Op.or]: [
            {
              title: {
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
