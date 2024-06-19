import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { HttpModule } from '@nestjs/axios';
import { IdentityVerificationService } from './service/identity.service';
import { IdentityVerifcationController } from './controller/identity.controller';

@Module({
  controllers: [IdentityVerifcationController],
  providers: [IdentityVerificationService],
  exports: [IdentityVerificationService],
  imports: [HttpModule],
})
export class IdentityVerificationModule {}
