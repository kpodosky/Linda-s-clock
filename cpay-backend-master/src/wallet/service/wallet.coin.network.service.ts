import { BaseService } from '@app/lib/db/db.service';
import { ModelCtor } from 'sequelize-typescript';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { WalletCreationDto } from '../dto/wallet.dto';
import { Op } from 'sequelize';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { WalletNetwork } from '../model/wallet.coin.network.model';
import { Coin } from '../model/coin.model';
import { CoinNetwork } from '../model/coin.network.model';
import { CreateWalletCoinNetworkDto } from '../dto/wallet.coin.network.dto';

@Injectable()
export class WalletNetworkService extends BaseService<WalletNetwork> {
  constructor(
    @InjectModel(WalletNetwork)
    private readonly walletNetworkModel: ModelCtor<WalletNetwork>,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    super(walletNetworkModel);
  }

  initialize = (data: CreateWalletCoinNetworkDto) => {
    return new WalletNetwork(data);
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
      },
      {
        model: CoinNetwork,
        as: 'network',
        // attributes: ['id', 'name'],
      },
    ];
    options.where = { ...where, ...searchdata };
    options.order = [['createdAt', 'DESC']];
    Logger.debug(`Retrieving wallets for ${query.businessId}`);

    return await this.paginatedResult(options);
  };
  search2 = async (query: any) => {
    const where: any = {};
    const options: any = { page: query.page, limit: query.limit };

    if (query.businessId) {
      where.businessId = query.businessId;
    }
    if (query.coinId) {
      where.coinId = query.coinId;
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
        attributes: ['name', 'code', 'image'],
        include: [
          {
            model: CoinNetwork,
            as: 'networks',
            attributes: ['id', 'name', 'code'],
          },
        ],
      },
    ];

    // Set the where and searchdata conditions together
    options.where = { ...where, ...searchdata };

    // Set the order by createdAt in descending order
    options.order = [['createdAt', 'DESC']];

    // Define the attributes to exclude
    options.attributes = {
      exclude: ['address', 'scanCode', 'coinId', 'networkId', 'walletId', 'id'],
    };

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
      {
        model: CoinNetwork,
        as: 'network',
        // attributes: ['id', 'name'],
      },
    ];
    options.where = { ...where, ...searchdata };
    options.order = [['createdAt', 'DESC']];
    // Logger.debug(`Retrieving wallets for ${query.businessId}`);

    return await this.paginatedResult(options);
  };
}
