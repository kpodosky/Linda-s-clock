import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Activity } from './model/activities.model';
import { ActivityController } from './controller/activities.controller';
import { ActivityService } from './service/activities.service';
import { ActivityHandler } from './handler/activity.handler';

@Module({
  controllers: [ActivityController],
  providers: [ActivityService, ActivityHandler],
  imports: [SequelizeModule.forFeature([Activity])],
  exports: [ActivityService],
})
export class ActivityModule {}
