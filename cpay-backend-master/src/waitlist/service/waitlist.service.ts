import { BaseService } from '@app/lib/db/db.service';
import { ModelCtor } from 'sequelize-typescript';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { WaitList } from '../model/waitlist.model';
import { SignUpWaitlistDto } from '../dto/waitlist.dto';

@Injectable()
export class WaitListService extends BaseService<WaitList> {
  constructor(
    @InjectModel(WaitList)
    private readonly waitListModel: ModelCtor<WaitList>,
  ) {
    super(waitListModel);
  }

  initialize = (data: SignUpWaitlistDto) => {
    return new WaitList(data);
  };
}
