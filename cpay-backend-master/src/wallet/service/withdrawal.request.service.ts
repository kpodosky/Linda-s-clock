import { ModelCtor } from 'sequelize-typescript';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { BaseService } from '@app/lib/db/db.service';
import { WithdrawalRequests } from '../model/withdrawal.request.model';
import { CpayBusiness } from 'src/business/model/cpay.business.model';
import {
  walletWithdrawalRequestDto,
  walletWithdrawalRequestFilterDto,
} from '../dto/withdrawal.request.dto';
import { CpayBusinessProfile } from 'src/business/model/cpay.business.profile.model';

@Injectable()
export class WithdrawalRequestService extends BaseService<WithdrawalRequests> {
  constructor(
    @InjectModel(WithdrawalRequests)
    private readonly withdrawalRequestsModel: ModelCtor<WithdrawalRequests>,
  ) {
    super(withdrawalRequestsModel);
  }

  initialize = (data: walletWithdrawalRequestDto) => {
    return new WithdrawalRequests(data);
  };

  search = async (query: walletWithdrawalRequestFilterDto) => {
    const where: any = {};
    const options: any = { page: query.page, limit: query.limit, where };

    if (query.transactionId) {
      where.id = query.transactionId;
    }
    if (query.businessId) {
      where.businessId = query.businessId;
    }
    if (query.amount) {
      where.amount = query.amount;
    }
    if (query.userId) {
      where.userId = query.userId;
    }
    if (query.reference) {
      where.reference = query.reference;
    }
    if (query.reference) {
      where.reference = query.reference;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.trxRef) {
      where.trxRef = query.trxRef;
    }

    const searchdata = query.search
      ? {
          [Op.or]: [
            {
              reference: {
                [Op.like]: `%${query.search}%`,
              },
            },
            {
              name: {
                [Op.like]: `%${query.search}%`,
              },
            },
            {
              '$business.profile.email$': {
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
        model: CpayBusiness,
        as: 'business',
        attributes: ['id', 'name', 'businessStatus'],
        include: [
          {
            model: CpayBusinessProfile,
            as: 'profile',
            required: false,
          },
        ],
      },
    ];

    return await this.paginatedResult(options);
  };
}
