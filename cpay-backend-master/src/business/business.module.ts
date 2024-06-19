import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CpayBusinessConfigurationService } from './service/cpay.business.configuration.service';
import { CpayBusinessConfiguration } from './model/cpay.business.configuration.model';
import { CpayBusinessService } from './service/cpay.business.service';
import { CpayBusiness } from './model/cpay.business.model';
import { CpayBusinessProfileService } from './service/cpay.business.profile.service';
import { CpayRoleService } from './service/cpay.role.service';
import { CypayUserRoleService } from './service/cpay.user.role.service';
import { CpayUserRole } from './model/cpay.user.role.model';
import { CpayUserService } from './service/cpay.user.service';
import { CpayUser } from './model/cpay.user.model';
import { CpayBusinessProfile } from './model/cpay.business.profile.model';
import { CpayRole } from './model/cpay.role.model';
import { BusinessController } from './controller/business.controller';
import { BusinessHandler } from './handler/business.handler';
import { OtpService } from 'src/otp/services/otp.service';
import { Otp } from 'src/otp/model/otp.model';
import { HttpModule } from '@nestjs/axios';
import { WalletService } from 'src/wallet/service/wallet.service';
import { Wallet } from 'src/wallet/model/wallet.model';
import { FileService } from 'src/file/service/file.service';
import { CpayBusinessCustomer } from './model/cpay.business.customer.model';
import { CpayBusinessCustomerService } from './service/cpay.business.customer.service';
import { CpayBusinessLocationService } from './service/cpay.business.location.service';
import { ActivityService } from 'src/activities/service/activities.service';
import { Activity } from 'src/activities/model/activities.model';
import { CsvService } from '@app/lib/function/cv.generator.service';
import { CpayBusinessLocation } from './model/cpay.business.location.model';
import { CpayLoginDeviceService } from './service/cpay.login.device.service';
import { LoginDevice } from './model/cpay.business.login.device.model';
import { IdentityVerificationService } from 'src/identity-verification/service/identity.service';
import { LoginActivityService } from './service/login.activity.service';
import { LoginActivity } from './model/login.activity.model';

@Module({
  controllers: [BusinessController],
  providers: [
    CpayBusinessConfigurationService,
    CpayBusinessService,
    CpayBusinessProfileService,
    CpayRoleService,
    CypayUserRoleService,
    CpayUserService,
    BusinessHandler,
    OtpService,
    WalletService,
    FileService,
    CpayBusinessCustomerService,
    CpayBusinessLocationService,
    ActivityService,
    CsvService,
    CpayLoginDeviceService,
    IdentityVerificationService,
    // LoginActivityService,
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
      Wallet,
      CpayBusinessCustomer,
      CpayBusinessLocation,
      Activity,
      LoginDevice,
      // LoginActivity,
    ]),
  ],
  exports: [
    CpayUserService,
    CpayBusinessProfileService,
    CpayBusinessConfigurationService,
    CypayUserRoleService,
    CpayRoleService,
    CpayBusinessLocationService,
    CpayBusinessService,
    CpayLoginDeviceService,
    // LoginActivityService,
  ],
})
export class BusinessModule {}
