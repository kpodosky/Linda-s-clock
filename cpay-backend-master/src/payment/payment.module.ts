import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PaymentLink } from './model/payment.link.model';
import { PaymentLinkService } from './service/payment.link.service';
import { PaymentLinkController } from './controller/payment.link.controller';
import { FileService } from 'src/file/service/file.service';
import { CpayBusinessCustomerService } from 'src/business/service/cpay.business.customer.service';
import { CpayBusinessCustomer } from 'src/business/model/cpay.business.customer.model';
import { PaymentLinkTransactionService } from './service/payment.link.transaction.service';
import { PaymentLinkTransaction } from './model/payment.link.transaction.model';
import { TransactionService } from 'src/transaction/service/transaction.service';
import { Transaction } from 'src/transaction/model/transaction.model';
import { RateService } from 'src/rate/service/rate.service';
import { Rate } from 'src/rate/model/rate.model';
import { CpayBusinessService } from 'src/business/service/cpay.business.service';
import { CpayBusiness } from 'src/business/model/cpay.business.model';
import { WalletService } from 'src/wallet/service/wallet.service';
import { Wallet } from 'src/wallet/model/wallet.model';
import { HttpModule } from '@nestjs/axios';
import { CsvService } from '@app/lib/function/cv.generator.service';
import { CoinNetwork } from 'src/wallet/model/coin.network.model';
import { WalletNetwork } from 'src/wallet/model/wallet.coin.network.model';
import { Coin } from 'src/wallet/model/coin.model';
import { WalletNetworkService } from 'src/wallet/service/wallet.coin.network.service';
import { CoinNetworkService } from 'src/wallet/service/coin.network.service';
import { AppConfigService } from 'src/app-config/service/app-config.service';
import { AppConfiguration } from 'src/app-config/model/app-config.model';

@Module({
  controllers: [PaymentLinkController],
  providers: [
    PaymentLinkService,
    FileService,
    CpayBusinessCustomerService,
    PaymentLinkTransactionService,
    TransactionService,
    RateService,
    CpayBusinessService,
    WalletService,
    CsvService,
    WalletNetworkService,
    AppConfigService,
    CoinNetworkService,
  ],
  exports: [PaymentLinkService],
  imports: [
    HttpModule,
    SequelizeModule.forFeature([
      PaymentLink,
      CpayBusinessCustomer,
      PaymentLinkTransaction,
      Transaction,
      Coin,
      PaymentLink,
      Rate,
      CpayBusiness,
      Wallet,
      WalletNetwork,
      CoinNetwork,
      CoinNetwork,
      AppConfiguration,
    ]),
  ],
})
export class PaymentLinkModule {}
