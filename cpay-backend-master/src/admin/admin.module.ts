import { Global, Module } from '@nestjs/common';
import { AdminService } from './service/admin.service';
import { HttpModule } from '@nestjs/axios';
import { SequelizeModule } from '@nestjs/sequelize';
import { Admin } from './model/admin.model';
import { AdminController } from './controller/admin.controller';
import { TransactionService } from 'src/transaction/service/transaction.service';
import { Transaction } from 'src/transaction/model/transaction.model';
import { AppConfigService } from 'src/app-config/service/app-config.service';
import { AdminRoleService } from './service/admin.role.service';
import { AdminRoles } from './model/admin.role';
import { AdminHandler } from './handler/admin.handler';
import { FileService } from 'src/file/service/file.service';
import { OtpService } from 'src/otp/services/otp.service';
import { Otp } from 'src/otp/model/otp.model';
import { CpayUserService } from 'src/business/service/cpay.user.service';
import { CpayUser } from 'src/business/model/cpay.user.model';
import { WalletService } from 'src/wallet/service/wallet.service';
import { Wallet } from 'src/wallet/model/wallet.model';
import { CpayBusinessService } from 'src/business/service/cpay.business.service';
import { CpayBusiness } from 'src/business/model/cpay.business.model';
import { RateService } from 'src/rate/service/rate.service';
import { Rate } from 'src/rate/model/rate.model';
import { PaymentLink } from 'src/payment/model/payment.link.model';
import { PaymentLinkService } from 'src/payment/service/payment.link.service';
import { PaymentLinkTransactionService } from 'src/payment/service/payment.link.transaction.service';
import { PaymentLinkTransaction } from 'src/payment/model/payment.link.transaction.model';
import { CsvService } from '@app/lib/function/cv.generator.service';
import { WalletNetworkService } from 'src/wallet/service/wallet.coin.network.service';
import { WalletNetwork } from 'src/wallet/model/wallet.coin.network.model';
import { CoinService } from 'src/wallet/service/coin.service';
import { Coin } from 'src/wallet/model/coin.model';
import { CoinNetworkService } from 'src/wallet/service/coin.network.service';
import { CoinNetwork } from 'src/wallet/model/coin.network.model';
import { AdminActivityService } from './service/admin.activities.service';
import { AdminActivity } from './model/activity.modal';
import { AppConfiguration } from 'src/app-config/model/app-config.model';
import { WithdrawalRequests } from 'src/wallet/model/withdrawal.request.model';
import { WithdrawalRequestService } from 'src/wallet/service/withdrawal.request.service';
@Global()
@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    TransactionService,
    AppConfigService,
    AdminRoleService,
    AdminHandler,
    FileService,
    OtpService,
    CpayUserService,
    WalletService,
    AppConfigService,
    CpayBusinessService,
    RateService,
    PaymentLinkService,
    PaymentLinkTransactionService,
    CsvService,
    WalletNetworkService,
    CoinService,
    CoinNetworkService,
    AdminActivityService,
    WithdrawalRequestService,
  ],
  exports: [AdminService, AdminActivityService],
  imports: [
    HttpModule,
    SequelizeModule.forFeature([
      Admin,
      Transaction,
      AdminRoles,
      Otp,
      CpayUser,
      Wallet,
      AppConfiguration,
      CpayBusiness,
      Rate,
      PaymentLink,
      PaymentLinkTransaction,
      WalletNetwork,
      Coin,
      CoinNetwork,
      AdminActivity,
      WithdrawalRequests,
    ]),
  ],
})
export class AdminModule {}
