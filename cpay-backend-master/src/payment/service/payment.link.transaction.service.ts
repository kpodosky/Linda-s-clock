import { BaseService } from '@app/lib/db/db.service';
import { ModelCtor } from 'sequelize-typescript';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { PaymentLinkTransaction } from '../model/payment.link.transaction.model';
import {
  CreatePaymentLinkTransactionDto,
  PaymentLinkTransactionFilterDto,
} from '../dto/payment.link.transaction.dto';
import { Transaction } from 'src/transaction/model/transaction.model';
import { CpayBusinessCustomer } from 'src/business/model/cpay.business.customer.model';

@Injectable()
export class PaymentLinkTransactionService extends BaseService<PaymentLinkTransaction> {
  constructor(
    @InjectModel(PaymentLinkTransaction)
    private readonly paymentLinkModel: ModelCtor<PaymentLinkTransaction>,
  ) {
    super(PaymentLinkTransaction);
  }

  initialize = (data: CreatePaymentLinkTransactionDto) => {
    return new PaymentLinkTransaction(data);
  };

  search = async (query: PaymentLinkTransactionFilterDto) => {
    const where: any = {};
    const options: any = { page: query.page, limit: query.limit, where };

    if (query.businessId) {
      where.businessId = query.businessId;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.transactionId) {
      where.id = query.transactionId;
    }
    if (query.paymentLinkId) {
      where.paymentLinkId = query.paymentLinkId;
    }
    if (query.reference) {
      where.reference = query.reference;
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
    options.include = [
      {
        model: Transaction,
        as: 'transaction',
        attributes: [
          'rateInUsd',
          'cryptoValue',
          'type',
          'status',
          'currency',
          'category',
        ],
      },
      {
        model: CpayBusinessCustomer,
        as: 'sender',
        attributes: ['firstName', 'lastName', 'email'],
      },
    ];

    return await this.paginatedResult(options);
  };
}
