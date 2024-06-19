import { BaseService } from '@app/lib/db/db.service';
import { ModelCtor } from 'sequelize-typescript';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Coin } from '../model/coin.model';
import { CoinNetwork } from '../model/coin.network.model';
import { CreateCoinNetworkDto } from '../dto/coin.network.dto';

@Injectable()
export class CoinNetworkService extends BaseService<CoinNetwork> {
  constructor(
    @InjectModel(CoinNetwork)
    private readonly coinNetworkModel: ModelCtor<CoinNetwork>,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    super(coinNetworkModel);
  }

  initialize = (data: CreateCoinNetworkDto) => {
    return new CoinNetwork(data);
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
    if (query.category) {
      where.category = query.category;
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
    options.include = [
      {
        model: Coin,
        as: 'coin',
        // attributes: ['id', 'name'],
      },
    ];
    options.where = { ...where, ...searchdata };
    options.order = [['createdAt', 'DESC']];
    Logger.debug(`Retrieving wallets for ${query.businessId}`);

    return await this.paginatedResult(options);
  };

  adminSearch = async (query: any) => {
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
    options.include = [
      {
        model: Coin,
        as: 'coin',
        // attributes: ['id', 'name'],
      },
    ];
    options.where = { ...where, ...searchdata };
    options.order = [['createdAt', 'DESC']];

    return await this.paginatedResult(options);
  };
}
