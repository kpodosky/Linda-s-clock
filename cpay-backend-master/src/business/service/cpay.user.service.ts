import { BaseService } from '@app/lib/db/db.service';
import { ModelCtor } from 'sequelize-typescript';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CpayUser } from '../model/cpay.user.model';
import { CpayBusiness } from '../model/cpay.business.model';
import { isMatchingNameDto } from '../dto/cpay.user.dto';
import { CpayUserRole } from '../model/cpay.user.role.model';
import { CpayRole } from '../model/cpay.role.model';

@Injectable()
export class CpayUserService extends BaseService<CpayUser> {
  constructor(
    @InjectModel(CpayUser)
    private readonly cpayUserModel: ModelCtor<CpayUser>,
  ) {
    super(cpayUserModel);
  }

  initialize = (data: any) => {
    return new CpayUser(data);
  };

  search = async (query: any) => {
    const where: any = {};
    const options: any = { page: query.page, limit: query.limit, where };

    if (query.status) {
      where.status = query.status;
    }

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

    if (query.search) {
      const searchdata = {
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
      };
      where[Op.and] = [where, searchdata];
    }

    options.order = [['createdAt', 'DESC']];
    options.include = [];
    where.createdAt = {
      [Op.ne]: null,
    };
    options.include = [
      {
        model: CpayBusiness,
        where: query.businessId ? { id: query.businessId } : {},
        required: !!query.businessId,
      },
    ];

    // if (query.businessId) {
    //   options.include.push({
    //     model: CpayBusiness,
    //     where: { id: query.businessId },
    //   });
    // }
    return await this.paginatedResult(options);
  };

  adminSearch = async (query: any) => {
    const where: any = {};
    const options: any = { page: query.page, limit: query.limit, where };

    if (query.status) {
      where.status = query.status;
    }

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

    if (query.search) {
      const searchdata = {
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
      };
      where[Op.and] = [where, searchdata];
    }

    options.order = [['createdAt', 'DESC']];
    options.include = [];

    // Add inclusion for CpayBusiness model if businessId is provided
    if (query.businessId) {
      options.include.push({
        model: CpayBusiness,
        where: { id: query.businessId }, // Filter by businessId
      });
    }
    return await this.paginatedResult(options);
  };

  isMatchingName = (data: isMatchingNameDto) => {
    const lowerCaseFirstName = data.registeredFirstName.trim().toLowerCase();
    const lowerCaseLastName = data.registeredLastName.trim().toLowerCase();
    const lowerCaseProviderFirstName = data.providerReturnedFirstName
      .trim()
      .toLowerCase();
    const lowerCaseProviderLastName = data.providerReturnedLastName
      .trim()
      .toLowerCase();
    return (
      lowerCaseProviderFirstName === lowerCaseFirstName &&
      lowerCaseProviderLastName === lowerCaseLastName
    );
  };
}
