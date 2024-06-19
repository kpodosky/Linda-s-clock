import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppConfigService } from './service/app-config.service';
import { AppConfiguration } from './model/app-config.model';
import { AppConfigController } from './controller/app-config.controller';

@Module({
  controllers: [AppConfigController],
  providers: [AppConfigService],
  imports: [SequelizeModule.forFeature([AppConfiguration])],
  exports: [AppConfigService],
})
export class AppConfigModule {}
