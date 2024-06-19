import { BaseService } from '@app/lib/db/db.service';
import { ModelCtor, Sequelize } from 'sequelize-typescript';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Wallet } from '../model/wallet.model';
import {
  BusinessWalletSearchValidatorDto,
  WalletCreationDto,
} from '../dto/wallet.dto';
import { Op } from 'sequelize';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { WalletNetwork } from '../model/wallet.coin.network.model';
import { Coin } from '../model/coin.model';
import { CoinNetwork } from '../model/coin.network.model';

@Injectable()
export class WalletService extends BaseService<Wallet> {
  constructor(
    @InjectModel(Wallet)
    private readonly walletModel: ModelCtor<Wallet>,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    super(walletModel);
  }

  initialize = (data: WalletCreationDto) => {
    return new Wallet(data);
  };

  cryptoWallet = async (query: BusinessWalletSearchValidatorDto) => {
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
    options.attributes = {
      ...options.attributes,
      exclude: [
        'businessId',
        'coinId',
        'availableBalance',
        'ledgerBalance',
        'createdAt',
        'updatedAt',
      ],
    };
    options.where = { ...where, ...searchdata };
    options.order = [['createdAt', 'DESC']];
    Logger.debug(`Retrieving wallets for ${query.businessId}`);

    return await this.paginatedResult(options);
  };

  search = async (query: BusinessWalletSearchValidatorDto) => {
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
    options.where = { ...where, ...searchdata };
    options.order = [['createdAt', 'DESC']];
    Logger.debug(`Retrieving wallets for ${query.businessId}`);

    return await this.paginatedResult(options);
  };

  adminSearch = async (query: BusinessWalletSearchValidatorDto) => {
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
        model: WalletNetwork,
        as: 'networks',
        // attributes: ['id', 'name'],
        include: [
          {
            model: Coin,
            as: 'coin',
          },
          {
            model: CoinNetwork,
            as: 'network',
          },
        ],
      },
    ];
    options.where = { ...where, ...searchdata };
    options.order = [['createdAt', 'DESC']];
    // Logger.debug(`Retrieving wallets for ${query.businessId}`);

    return await this.paginatedResult(options);
  };

  walletSum = async () => {
    const getWallet = await Wallet.findAll({
      attributes: [
        'currency',
        'name',
        'icon',
        [
          Sequelize.fn('SUM', Sequelize.col('availableBalance')),
          'totalBalance',
        ],
      ],
      group: ['currency', 'name', 'icon'],
      raw: true,
    });

    return {
      message: 'Wallet retrieved successfully',
      data: getWallet,
    };
  };
}
