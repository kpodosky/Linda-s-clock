import { Injectable, Logger } from '@nestjs/common';
import { ActivityService } from '../service/activities.service';
import { CreateActivityDto } from '../dto/activities.dto';
import { ActivityEvent } from '../event/activity.event';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ActivityHandler {
  constructor(private readonly activityService: ActivityService) {}

  @OnEvent(ActivityEvent.REGISTER_MEMBER_ACTIVITY)
  async adminLog(data: CreateActivityDto) {
    Logger.debug('...**************', data);
    const activity = await this.activityService.initialize(data);
    await activity.save();
  }
}
