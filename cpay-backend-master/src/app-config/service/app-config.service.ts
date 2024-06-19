import { Injectable } from '@nestjs/common';
import { ModelCtor } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { AppConfiguration } from '../model/app-config.model';
import { CreateAppConfigDto, FilterAppConfigDto } from '../dto/app-config.dto';
import { BaseService } from '@app/lib/db/db.service';

@Injectable()
export class AppConfigService extends BaseService<AppConfiguration> {
  constructor(
    @InjectModel(AppConfiguration)
    private readonly appConfigModel: ModelCtor<AppConfiguration>,
  ) {
    super(appConfigModel);
  }

  initialize = (data: CreateAppConfigDto) => {
    return new AppConfiguration(data);
  };

  search = async (query: FilterAppConfigDto) => {
    const where: any = {};
    const options: any = { page: query.page, limit: query.limit, where };

    if (query.source) {
      where.source = query.source;
    }
    if (query.configId) {
      where.id = query.configId;
    }

    const searchdata = query.search
      ? {
          [Op.or]: [
            {
              source: {
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
