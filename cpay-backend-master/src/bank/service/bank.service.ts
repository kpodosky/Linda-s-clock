import { ModelCtor } from 'sequelize-typescript';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Bank } from '../model/bank.model';
import {
  AddBankAccountDto,
  BankAccountSearchValidatorDto,
} from '../dto/bank.dto';
import { Op } from 'sequelize';
import { BaseService } from '@app/lib/db/db.service';

@Injectable()
export class BankAccountService extends BaseService<Bank> {
  constructor(
    @InjectModel(Bank)
    private readonly bankModel: ModelCtor<Bank>,
  ) {
    super(bankModel);
  }

  initialize = (data: AddBankAccountDto) => {
    return new Bank(data);
  };

  search = async (query: BankAccountSearchValidatorDto) => {
    const where: any = {};
    const options: any = { page: query.page, limit: query.limit, where };

    if (query.accountName) {
      where.accountName = query.accountName;
    }
    if (query.bankName) {
      where.bankName = query.bankName;
    }
    if (query.currency) {
      where.currency = query.currency;
    }
    if (query.businessId) {
      where.businessId = query.businessId;
    }
    where.active = true;

    const searchdata = query.search
      ? {
          [Op.or]: [
            {
              accountName: {
                [Op.like]: `%${query.search}%`,
              },
            },
            {
              bankName: {
                [Op.like]: `%${query.search}%`,
              },
            },
            {
              currency: {
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
