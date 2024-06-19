import { ModelCtor } from 'sequelize-typescript';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Transaction } from '../model/transaction.model';
import {
  AdminTransactionFilterDto,
  TransactionCreateDto,
  TransactionFilterDto,
} from '../dtos/transaction.dto';
import { BaseService } from '@app/lib/db/db.service';
import { getFormattedTimestamp } from '@app/lib/function/time.compare';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';

@Injectable()
export class TransactionService extends BaseService<Transaction> {
  private readonly tronscanApi: string = 'https://apilist.tronscanapi.com/api';
  private readonly optimismApi: string =
    'https://api-optimistic.etherscan.io/api';
  private readonly etherScanApi: string =
    'https://api-optimistic.etherscan.io/api';
  private readonly polygonScanApi: string =
    'https://api-optimistic.etherscan.io/api';
  constructor(
    @InjectModel(Transaction)
    private readonly transactionModel: ModelCtor<Transaction>,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    super(transactionModel);
  }

  initialize = (data: TransactionCreateDto) => {
    return new Transaction(data);
  };

  mySearch = async (query: TransactionFilterDto) => {
    const where: any = {};
    const options: any = { page: query.page, limit: query.limit, where };

    if (query.transactionId) {
      where.id = query.transactionId;
    }
    if (query.amount) {
      where.amount = query.amount;
    }
    if (query.businessId) {
      where.businessId = query.businessId;
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.reference) {
      where.reference = query.reference;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.providerReference) {
      where.providerReference = query.providerReference;
    }
    if (query.providerReference) {
      where.providerReference = query.providerReference;
    }
    if (query.previousBalance) {
      where.previousBalance = query.previousBalance;
    }
    if (query.walletId) {
      where.walletId = query.walletId;
    }
    if (query.paymentLinkId) {
      where.paymentLinkId = query.paymentLinkId;
    }

    const searchdata = query.search
      ? {
          [Op.or]: [
            {
              description: {
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
    options.attribute = ['meta'];

    return await this.paginatedResult(options);
  };

  search = async (query: AdminTransactionFilterDto) => {
    const where: any = {};
    const options: any = { page: query.page, limit: query.limit, where };

    if (query.transactionId) {
      where.id = [...query.transactionId];
    }
    if (query.amount) {
      where.amount = query.amount;
    }
    if (query.businessId) {
      where.businessId = Array.isArray(query.businessId)
        ? [...query.businessId]
        : query.businessId;
    }
    if (query.type) {
      where.type = Array.isArray(query.type) ? [...query.type] : query.type;
    }
    if (query.reference) {
      where.reference = Array.isArray(query.reference)
        ? [...query.reference]
        : query.reference;
    }
    if (query.status) {
      where.status = Array.isArray(query.status)
        ? [...query.status]
        : query.status;
    }
    if (query.providerReference) {
      where.providerReference = query.providerReference;
    }
    if (query.previousBalance) {
      where.previousBalance = query.previousBalance;
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
              providerReference: {
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

  TransactionReferencePrefix = (service: any) => {
    const random = Math.floor(1000 + Math.random() * 9000);

    let reference;
    switch (service) {
      case 'book':
        reference = `NIDI-ODR-${getFormattedTimestamp()}-${random}`;
        break;
      case 'withdrawal':
        reference = `NIDI-WTH-${getFormattedTimestamp()}-${random}`;
        break;
      case 'deposit':
        reference = `NIDI-DEP-${getFormattedTimestamp()}-${random}`;
        break;
    }
    return reference;
  };

  async makeTronScanGetRequest(url: string): Promise<any> {
    const headers = {
      'TRON-PRO-API-KEY': this.configService.get('TRONSCAN_API_KEY_TOKEN'),
    };
    const response: AxiosResponse<any> = await this.httpService
      .get(`${this.tronscanApi}/transaction-info?hash=${url}`, { headers })
      .toPromise();
    return response.data;
  }

  async makeOptimismGetRequest(url: string): Promise<any> {
    const response: AxiosResponse<any> = await this.httpService
      .get(
        `${
          this.optimismApi
        }?module=transaction&action=getstatus&txhash=${url}&apikey=${this.configService.get(
          'OPTIMISM_SEC_KEY',
        )}`,
      )
      .toPromise();
    return response.data;
  }

  async makeEtherScanGetRequest(url: string): Promise<any> {
    const response: AxiosResponse<any> = await this.httpService
      .get(
        `${
          this.etherScanApi
        }?module=transaction&action=getstatus&txhash=${url}&apikey=${this.configService.get(
          'ETHER_SCAN_KEY',
        )}`,
      )
      .toPromise();
    return response.data;
  }

  async makePolygonScanGetRequest(url: string): Promise<any> {
    const response: AxiosResponse<any> = await this.httpService
      .get(
        `${
          this.polygonScanApi
        }?module=transaction&action=gettxreceiptstatus&txhash=${url}&apikey=${this.configService.get(
          'POLYGON_SCAN_KEY',
        )}`,
      )
      .toPromise();
    return response.data;
  }

  async makeBscScanGetRequest(url: string): Promise<any> {
    const response: AxiosResponse<any> = await this.httpService
      .get(
        `${
          this.polygonScanApi
        }?module=transaction&action=getstatus&txhash=${url}&apikey=${this.configService.get(
          'POLYGON_SCAN_KEY',
        )}`,
      )
      .toPromise();
    return response.data;
  }
}
