import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SequelizeModuleOptions,
  SequelizeOptionsFactory,
} from '@nestjs/sequelize';
import { Activity } from 'src/activities/model/activities.model';
import { Admin } from 'src/admin/model/admin.model';
import { AdminRoles } from 'src/admin/model/admin.role';
import { CpayBusinessConfiguration } from 'src/business/model/cpay.business.configuration.model';
import { CpayBusinessCustomer } from 'src/business/model/cpay.business.customer.model';
import { CpayBusinessLocation } from 'src/business/model/cpay.business.location.model';
import { CpayBusiness } from 'src/business/model/cpay.business.model';
import { CpayBusinessProfile } from 'src/business/model/cpay.business.profile.model';
import { CpayRole } from 'src/business/model/cpay.role.model';
import { CpayUser } from 'src/business/model/cpay.user.model';
import { CpayUserRole } from 'src/business/model/cpay.user.role.model';
import { Otp } from 'src/otp/model/otp.model';
import { PaymentLink } from 'src/payment/model/payment.link.model';
import { PaymentLinkTransaction } from 'src/payment/model/payment.link.transaction.model';
import { Transaction } from 'src/transaction/model/transaction.model';
import { Wallet } from 'src/wallet/model/wallet.model';
import { Rate } from 'src/rate/model/rate.model';
import { Bank } from 'src/bank/model/bank.model';
import { WaitList } from 'src/waitlist/model/waitlist.model';
import { LoginDevice } from 'src/business/model/cpay.business.login.device.model';
import { WalletNetwork } from 'src/wallet/model/wallet.coin.network.model';
import { CoinNetwork } from 'src/wallet/model/coin.network.model';
import { Coin } from 'src/wallet/model/coin.model';
import { AdminActivity } from 'src/admin/model/activity.modal';
import { AppConfiguration } from 'src/app-config/model/app-config.model';
import { LoginActivity } from 'src/business/model/login.activity.model';
import { WithdrawalRequests } from 'src/wallet/model/withdrawal.request.model';

@Injectable()
export class DbService implements SequelizeOptionsFactory {
  constructor(private configService: ConfigService) {}

  createSequelizeOptions(): SequelizeModuleOptions {
    const sequelizeOptions: SequelizeModuleOptions = {
      dialect: 'postgres',
      host: this.configService.get('POSTGRES_DB_HOST'),
      port: this.configService.get<number>('POSTGRES_DB_PORT'),
      username: this.configService.get('POSTGRES_DB_USER'),
      password: this.configService.get('POSTGRES_DB_PASSWORD'),
      database: this.configService.get('POSTGRES_DB_NAME'),
      models: [
        Wallet,
        Transaction,
        Otp,
        CpayBusinessConfiguration,
        CpayBusiness,
        CpayBusinessProfile,
        CpayUserRole,
        CpayUser,
        CpayRole,
        CpayBusinessCustomer,
        PaymentLink,
        PaymentLinkTransaction,
        CpayBusinessLocation,
        Activity,
        Admin,
        AdminRoles,
        Rate,
        Bank,
        WaitList,
        CoinNetwork,
        LoginDevice,
        WalletNetwork,
        Coin,
        AdminActivity,
        AppConfiguration,
        LoginActivity,
        WithdrawalRequests,
      ],
    };

    return sequelizeOptions;
  }
}
