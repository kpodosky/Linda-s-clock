import { ModelCtor } from 'sequelize-typescript';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { BaseService } from '@app/lib/db/db.service';
import { Activity } from '../model/activities.model';
import { CreateActivityDto, FilterActivityDto } from '../dto/activities.dto';
import { CpayUser } from 'src/business/model/cpay.user.model';

@Injectable()
export class ActivityService extends BaseService<Activity> {
  constructor(
    @InjectModel(Activity)
    private readonly transactionModel: ModelCtor<Activity>,
  ) {
    super(transactionModel);
  }

  initialize = (data: CreateActivityDto) => {
    return new Activity(data);
  };

  search = async (query: FilterActivityDto) => {
    const where: any = {};
    const options: any = { page: query.page, limit: query.limit, where };

    if (query.businessId) {
      where.businessId = query.businessId;
    }
    if (query.memberId) {
      where.memberId = query.memberId;
    }
    if (query.businessId) {
      where.businessId = query.businessId;
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
        model: CpayUser,
        as: 'member',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
    ];
    options.order = [['createdAt', 'DESC']];

    return await this.paginatedResult(options);
  };
}
