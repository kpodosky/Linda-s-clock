import { Module } from '@nestjs/common';
import { Otp } from './model/otp.model';
import { OtpService } from './services/otp.service';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  providers: [OtpService],
  exports: [OtpService],
  imports: [SequelizeModule.forFeature([Otp])],
})
export class OtpModule {}
