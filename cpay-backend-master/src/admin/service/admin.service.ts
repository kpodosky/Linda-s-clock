import { ModelCtor, Sequelize } from 'sequelize-typescript';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Admin } from '../model/admin.model';
import {
  AdminAccessRequestDto,
  AdminFilterDto,
  UserBusinessTrendFilter,
} from '../dto/admin.dto';
import { TransactionService } from 'src/transaction/service/transaction.service';
import { AdminRoles } from '../model/admin.role';
import { WalletService } from 'src/wallet/service/wallet.service';
import { BaseService } from '@app/lib/db/db.service';
import { CpayUserService } from 'src/business/service/cpay.user.service';
import { CpayBusinessService } from 'src/business/service/cpay.business.service';
import * as moment from 'moment';
import { CpayUser } from 'src/business/model/cpay.user.model';
import { CpayBusiness } from 'src/business/model/cpay.business.model';

@Injectable()
export class AdminService extends BaseService<Admin> {
  constructor(
    @InjectModel(Admin)
    private readonly adminModel: ModelCtor<Admin>,
    private readonly transactionService: TransactionService,
    private readonly cpayUserService: CpayUserService,
    private readonly cpayBusinessService: CpayBusinessService,
  ) {
    super(adminModel);
  }

  initialize = (data: AdminAccessRequestDto) => {
    return new Admin(data);
  };

  search = async (query: AdminFilterDto) => {
    const where: any = {};
    const options: any = { page: query.page, limit: query.limit, where };

    if (query.adminId) {
      where.id = query.adminId;
    }
    if (query.fullName) {
      where.fullName = {
        [Op.iLike]: query.fullName,
      };
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.email) {
      where.email = {
        [Op.iLike]: query.email,
      };
    }

    const searchdata = query.search
      ? {
          [Op.or]: [
            {
              fullName: {
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
    options.include = [
      {
        model: AdminRoles,
        as: 'role',
        attributes: ['id', 'title', 'active'],
      },
    ];
    options.attributes = {
      exclude: ['password', 'lastToken', 'passwordChange'],
    };

    return await this.paginatedResult(options);
  };

  userBusinessTrends = async (data: UserBusinessTrendFilter) => {
    let groupAttribute: any;
    let dateFormat: string;
    let periodDuration: moment.unitOfTime.DurationConstructor;

    switch (data.period) {
      case 'day':
        groupAttribute = Sequelize.fn(
          'date_trunc',
          'day',
          Sequelize.col('createdAt'),
        );
        dateFormat = 'YYYY-MM-DD';
        periodDuration = 'day';
        break;
      case 'week':
        groupAttribute = Sequelize.literal('DATE_TRUNC(\'week\', "createdAt")');
        dateFormat = 'YYYY-[W]WW';
        periodDuration = 'week';
        break;
      case 'month':
        groupAttribute = Sequelize.fn(
          'date_trunc',
          'month',
          Sequelize.col('createdAt'),
        );
        dateFormat = 'YYYY-MM';
        periodDuration = 'month';
        break;
      case 'year':
        groupAttribute = Sequelize.fn(
          'date_trunc',
          'year',
          Sequelize.col('createdAt'),
        );
        dateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
        periodDuration = 'year';
        break;
      default:
        throw new Error('Invalid period');
    }

    // Fetch business creation trends
    const businessTrends = await CpayBusiness.findAll({
      attributes: [
        [groupAttribute, 'period'],
        [Sequelize.literal('COUNT(*)'), 'total_businesses'],
      ],
      group: [groupAttribute],
      order: [Sequelize.literal('period DESC')],
      raw: true,
    });

    // Fetch user registration trends
    const userTrends = await CpayUser.findAll({
      attributes: [
        [groupAttribute, 'period'],
        [Sequelize.literal('COUNT(*)'), 'total_users'],
      ],
      group: [groupAttribute],
      order: [Sequelize.literal('period DESC')],
      raw: true,
    });

    // Determine the starting point for the periods (most recent in the results or now)
    const startDate = moment().startOf(periodDuration);

    const periods: any[] = [];
    for (let i = 0; i < 10; i++) {
      periods.push({
        period: startDate
          .clone()
          .subtract(i, periodDuration)
          .format(dateFormat),
        total_businesses: 0,
        total_users: 0,
      });
    }

    const businessMap = new Map(
      businessTrends.map((item: any) => [
        moment(item.period).format(dateFormat),
        item.total_businesses,
      ]),
    );

    const userMap = new Map(
      userTrends.map((item: any) => [
        moment(item.period).format(dateFormat),
        item.total_users,
      ]),
    );

    const mergedData = periods.map((periodObj: any) => ({
      period: periodObj.period,
      total_businesses: businessMap.get(periodObj.period) || 0,
      total_users: userMap.get(periodObj.period) || 0,
    }));

    return { data: mergedData };
  };
}
