import { BaseService } from '@app/lib/db/db.service';
import { ModelCtor } from 'sequelize-typescript';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { PaymentLink } from '../model/payment.link.model';
import {
  CreatePaymentLinkDto,
  FilterPaymentLinkDto,
} from '../dto/payment.link.dto';
import { PaymentLinkStatusEnum } from '../enum/payment.link.enum';
import { CpayBusiness } from 'src/business/model/cpay.business.model';
import { CpayUser } from 'src/business/model/cpay.user.model';
import { Coin } from 'src/wallet/model/coin.model';
import { CoinNetwork } from 'src/wallet/model/coin.network.model';

@Injectable()
export class PaymentLinkService extends BaseService<PaymentLink> {
  constructor(
    @InjectModel(PaymentLink)
    private readonly paymentLinkModel: ModelCtor<PaymentLink>,
  ) {
    super(paymentLinkModel);
  }

  initialize = (data: CreatePaymentLinkDto) => {
    return new PaymentLink(data);
  };

  search = async (query: FilterPaymentLinkDto) => {
    const where: any = {};
    const options: any = { page: query.page, limit: query.limit, where };

    if (query.businessId) {
      where.businessId = query.businessId;
    }
    if (query.paymentLinkId) {
      where.id = query.paymentLinkId;
    }
    where.status = {
      [Op.ne]: PaymentLinkStatusEnum.deleted,
    };
    if (query.status) {
      where.status = query.status;
    }
    if (query.url) {
      where.url = query.url;
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
              redirectUrl: {
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
        model: CpayUser,
        as: 'creator',
        attributes: ['id', 'firstName', 'lastName'],
      },
      {
        model: Coin,
        as: 'coin',
        attributes: ['id', 'name', 'code', 'image'],
        include: [
          {
            model: CoinNetwork,
            as: 'networks',
            attributes: ['id', 'name', 'code', 'contractAddress'],
          },
        ],
      },
    ];
    options.attribute = ['meta'];

    return await this.paginatedResult(options);
  };

  adminSearch = async (query: FilterPaymentLinkDto) => {
    const where: any = {};
    const options: any = { page: query.page, limit: query.limit, where };

    if (query.businessId) {
      where.businessId = query.businessId;
    }
    where.status = {
      [Op.ne]: PaymentLinkStatusEnum.deleted,
    };
    if (query.status) {
      where.status = query.status;
    }
    if (query.url) {
      where.url = query.url;
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
              redirectUrl: {
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
        attribute: ['name', 'industry'],
      },
      {
        model: Coin,
        as: 'coin',
        attribute: ['id', 'name', 'code', 'image'],
      },
    ];

    return await this.paginatedResult(options);
  };
}
