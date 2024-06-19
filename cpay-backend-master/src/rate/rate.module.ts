import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Rate } from './model/rate.model';
import { RateService } from './service/rate.service';
import { RateController } from './controller/rate.controller';

@Module({
  controllers: [RateController],
  providers: [RateService],
  imports: [SequelizeModule.forFeature([Rate])],
  exports: [RateService],
})
export class RateModule {}
