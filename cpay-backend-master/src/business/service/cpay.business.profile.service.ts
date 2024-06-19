import { BaseService } from '@app/lib/db/db.service';
import { ModelCtor } from 'sequelize-typescript';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CpayBusinessProfile } from '../model/cpay.business.profile.model';
import { BusinessProfileUpdateDto } from '../dto/cpay.business.dto';

@Injectable()
export class CpayBusinessProfileService extends BaseService<CpayBusinessProfile> {
  constructor(
    @InjectModel(CpayBusinessProfile)
    private readonly cpayBusinessProfileModel: ModelCtor<CpayBusinessProfile>,
  ) {
    super(cpayBusinessProfileModel);
  }

  initialize = (data: BusinessProfileUpdateDto) => {
    return new CpayBusinessProfile(data);
  };
}
