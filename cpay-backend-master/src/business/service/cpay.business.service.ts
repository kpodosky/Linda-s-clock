import { BaseService } from '@app/lib/db/db.service';
import { ModelCtor } from 'sequelize-typescript';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CpayBusiness } from '../model/cpay.business.model';
import { BusinessFilterDto, createBusinesDto } from '../dto/cpay.business.dto';
import { BusinessAccountModeEnum } from '../enum/business.enum';
import { ConfigService } from '@nestjs/config';
import { CpayBusinessConfiguration } from '../model/cpay.business.configuration.model';
import { CpayBusinessProfile } from '../model/cpay.business.profile.model';
import { Wallet } from 'src/wallet/model/wallet.model';
import { CpayBusinessLocation } from '../model/cpay.business.location.model';
import { CpayUser } from '../model/cpay.user.model';

@Injectable()
export class CpayBusinessService extends BaseService<CpayBusiness> {
  constructor(
    @InjectModel(CpayBusiness)
    private readonly cpayBusinessModel: ModelCtor<CpayBusiness>,
    private readonly configService: ConfigService,
  ) {
    super(cpayBusinessModel);
  }

  initialize = (data: createBusinesDto) => {
    return new CpayBusiness(data);
  };

  search = async (query: BusinessFilterDto) => {
    const where: any = {};
    const options: any = { page: query.page, limit: 1000, where, include: [] };

    if (query.businessId) {
      where.id = query.businessId;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.level) {
      where.level = query.level;
    }
    if (query.businessStatus) {
      where.businessStatus = query.level;
    }

    const searchdata = query.search
      ? {
          [Op.or]: [
            {
              level: {
                [Op.like]: `%${query.search}%`,
              },
            },
            {
              name: {
                [Op.like]: `%${query.search}%`,
              },
            },
            {
              accountId: {
                [Op.like]: `%${query.search}%`,
              },
            },
            {
              industry: {
                [Op.like]: `%${query.search}%`,
              },
            },
            {
              '$profile.email': {
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
    // options.include.push({
    //   model: CpayBusinessProfile,
    //   as: 'profile',
    // });

    options.include = [
      {
        model: CpayBusinessProfile,
        as: 'profile',
        attributes: [
          'businessLogo',
          'businessRegistrationDocument',
          'registrationNumber',
          'email',
          'phoneNumber',
          'size',
          'description',
        ],
      },
      {
        model: CpayBusinessConfiguration,
        as: 'configuration',
        attributes: [
          'liveApiKey',
          'liveApiSecret',
          'sandBoxApiKey',
          'sandBoxApiSecret',
          'overPaymentAmount',
          'overPaymentRelative',
          'underPaymentAmount',
          'underPaymentRelative',
        ],
      },
      {
        model: Wallet,
        as: 'wallets',
      },
      {
        model: CpayBusinessLocation,
        as: 'location',
        attributes: ['address', 'city', 'state', 'country'],
      },
      {
        model: Wallet,
        as: 'wallets',
      },
      {
        model: CpayUser,
        as: 'owner',
        attributes: {
          exclude: ['passwordChange', 'lastToken', 'password'],
        },
      },
    ];
    options.where = { ...where, ...searchdata };
    options.order = [['createdAt', 'DESC']];

    return await this.paginatedResult(options);
  };

  ModeCheckForApiKey = (mode: BusinessAccountModeEnum) => {
    let apiKey;
    switch (mode) {
      case BusinessAccountModeEnum.sandbox:
        apiKey = this.configService.get('FIRE_BLOCK_API_SANDBOX_KEY');
        break;
      case BusinessAccountModeEnum.live:
        apiKey = this.configService.get('FIRE_BLOCK_API_LIVE_KEY');
        break;
      default:
        throw new ConflictException('Invalid account mode');
    }
    return apiKey;
  };

  ModeCheckForVault = (mode: BusinessAccountModeEnum, business: any) => {
    let vaultId;
    switch (mode) {
      case BusinessAccountModeEnum.sandbox:
        vaultId = business.sandBoxVaultId;
        break;
      case BusinessAccountModeEnum.live:
        vaultId = business.liveVaultId;
        break;
      default:
        throw new BadRequestException('Invalid business account mode');
    }
    return vaultId;
  };
}
