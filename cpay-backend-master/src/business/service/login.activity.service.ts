import { BaseService } from '@app/lib/db/db.service';
import { ModelCtor } from 'sequelize-typescript';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CpayUserRole } from '../model/cpay.user.role.model';
import { CpayUser } from '../model/cpay.user.model';
import { CpayRole } from '../model/cpay.role.model';
import { LoginActivity } from '../model/login.activity.model';

@Injectable()
export class LoginActivityService extends BaseService<LoginActivity> {
  constructor(
    @InjectModel(LoginActivity)
    private readonly loginActivityModel: ModelCtor<LoginActivity>,
  ) {
    super(loginActivityModel);
  }

  initialize = (data: any) => {
    return new LoginActivity(data);
  };
}
