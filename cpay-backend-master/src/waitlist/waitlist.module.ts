import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { WaitListService } from './service/waitlist.service';
import { WaitList } from './model/waitlist.model';
import { WaitlistController } from './controller/waitlist.controller';
import { WaitlistHandler } from './handler/waitlist.handler';

@Module({
  controllers: [WaitlistController],
  providers: [WaitListService, WaitlistHandler],
  imports: [SequelizeModule.forFeature([WaitList])],
  exports: [WaitListService],
})
export class WaitListModule {}
