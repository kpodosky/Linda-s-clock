import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthenticationController } from './controller/authentication.controller';
import { CpayBusinessConfigurationService } from 'src/business/service/cpay.business.configuration.service';
import { CpayBusinessService } from 'src/business/service/cpay.business.service';
import { CpayBusinessProfileService } from 'src/business/service/cpay.business.profile.service';
import { CpayRoleService } from 'src/business/service/cpay.role.service';
import { CpayUserService } from 'src/business/service/cpay.user.service';
import { CypayUserRoleService } from 'src/business/service/cpay.user.role.service';
import { CpayBusinessConfiguration } from 'src/business/model/cpay.business.configuration.model';
import { CpayBusiness } from 'src/business/model/cpay.business.model';
import { CpayBusinessProfile } from 'src/business/model/cpay.business.profile.model';
import { CpayUserRole } from 'src/business/model/cpay.user.role.model';
import { CpayUser } from 'src/business/model/cpay.user.model';
import { CpayRole } from 'src/business/model/cpay.role.model';
import { OtpService } from 'src/otp/services/otp.service';
import { Otp } from 'src/otp/model/otp.model';
import { HttpModule } from '@nestjs/axios';
import { AuthenticationHandler } from './handler/authentication.business.handler';
import { AuthenticationService } from './service/authentication.service';
import { AdminHandler } from 'src/admin/handler/admin.handler';
import { CpayLoginDeviceService } from 'src/business/service/cpay.login.device.service';
import { LoginDevice } from 'src/business/model/cpay.business.login.device.model';
import { AppConfigService } from 'src/app-config/service/app-config.service';
import { AppConfiguration } from 'src/app-config/model/app-config.model';
import { LoginActivityService } from 'src/business/service/login.activity.service';
import { LoginActivity } from 'src/business/model/login.activity.model';

@Module({
  controllers: [AuthenticationController],
  providers: [
    CpayBusinessConfigurationService,
    CpayBusinessService,
    CpayBusinessProfileService,
    CpayRoleService,
    CypayUserRoleService,
    CpayUserService,
    OtpService,
    AuthenticationHandler,
    AuthenticationService,
    AdminHandler,
    CpayLoginDeviceService,
    AppConfigService,
    LoginActivityService,
  ],
  imports: [
    HttpModule,
    SequelizeModule.forFeature([
      CpayBusinessConfiguration,
      CpayBusiness,
      CpayBusinessProfile,
      CpayUserRole,
      CpayUser,
      CpayRole,
      Otp,
      LoginDevice,
      AppConfiguration,
      LoginActivity,
    ]),
  ],
  exports: [],
})
export class AuthenticationModule {}
