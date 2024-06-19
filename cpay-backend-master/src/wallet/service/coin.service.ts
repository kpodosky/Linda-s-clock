import { BaseService } from '@app/lib/db/db.service';
import { ModelCtor } from 'sequelize-typescript';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { WalletCreationDto } from '../dto/wallet.dto';
import { Op } from 'sequelize';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Coin } from '../model/coin.model';
import { CoinNetwork } from '../model/coin.network.model';
import { CoinFilterDto, CreateCoinDto } from '../dto/coin.dto';

@Injectable()
export class CoinService extends BaseService<Coin> {
  constructor(
    @InjectModel(Coin)
    private readonly coinModel: ModelCtor<Coin>,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    super(coinModel);
  }

  initialize = (data: CreateCoinDto) => {
    return new Coin(data);
  };

  search = async (query: CoinFilterDto) => {
    const where: any = {};
    const options: any = { page: query.page, limit: query.limit, where };

    if (query.coinId) {
      where.id = query.coinId;
    }
    if (query.name) {
      where.name = {
        [Op.iLike]: query.name,
      };
    }
    if (query.code) {
      where.code = {
        [Op.iLike]: query.code,
      };
    }

    const searchdata = query.search
      ? {
          [Op.or]: [
            {
              name: {
                [Op.like]: `%${query.search}%`,
              },
            },
            {
              code: {
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
        model: CoinNetwork,
        as: 'networks',
        // attributes: ['id', 'name'],
      },
    ];
    options.where = { ...where, ...searchdata };
    options.order = [['createdAt', 'DESC']];

    return await this.paginatedResult(options);
  };

  adminSearch = async (query: CoinFilterDto) => {
    const where: any = {};
    const options: any = { page: query.page, limit: query.limit, where };

    if (query.coinId) {
      where.id = query.coinId;
    }
    if (query.name) {
      where.name = {
        [Op.iLike]: query.name,
      };
    }
    if (query.code) {
      where.code = {
        [Op.iLike]: query.code,
      };
    }

    const searchdata = query.search
      ? {
          [Op.or]: [
            {
              name: {
                [Op.like]: `%${query.search}%`,
              },
            },
            {
              code: {
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
        model: CoinNetwork,
        as: 'networks',
        // attributes: ['id', 'name'],
      },
    ];
    options.where = { ...where, ...searchdata };
    options.order = [['createdAt', 'DESC']];

    return await this.paginatedResult(options);
  };
}
