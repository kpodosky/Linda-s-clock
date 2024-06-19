import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { WalletService } from './service/wallet.service';
import { Wallet } from './model/wallet.model';
import { WalletController } from './controller/wallet.controller';
import { TransactionService } from 'src/transaction/service/transaction.service';
import { Transaction } from 'src/transaction/model/transaction.model';
import { HttpModule } from '@nestjs/axios';
import { CpayBusiness } from 'src/business/model/cpay.business.model';
import { CpayBusinessService } from 'src/business/service/cpay.business.service';
import { FlutterwaveService } from 'src/fluterwave/service/flutterwave.service';
import { BankAccountService } from 'src/bank/service/bank.service';
import { Bank } from 'src/bank/model/bank.model';
import { CoinNetworkService } from './service/coin.network.service';
import { CoinNetwork } from './model/coin.network.model';
import { CoinService } from './service/coin.service';
import { Coin } from './model/coin.model';
import { WalletNetworkService } from './service/wallet.coin.network.service';
import { WalletNetwork } from './model/wallet.coin.network.model';
import { AppConfigService } from 'src/app-config/service/app-config.service';
import { AppConfiguration } from 'src/app-config/model/app-config.model';
import { WithdrawalRequestService } from './service/withdrawal.request.service';
import { WithdrawalRequests } from './model/withdrawal.request.model';
import { RateService } from 'src/rate/service/rate.service';
import { Rate } from 'src/rate/model/rate.model';

@Module({
  controllers: [WalletController],
  providers: [
    WalletService,
    TransactionService,
    CpayBusinessService,
    FlutterwaveService,
    BankAccountService,
    CoinNetworkService,
    CoinService,
    WalletNetworkService,
    AppConfigService,
    WithdrawalRequestService,
    RateService,
  ],
  imports: [
    HttpModule,
    SequelizeModule.forFeature([
      Wallet,
      Transaction,
      CpayBusiness,
      Bank,
      CoinNetwork,
      Coin,
      WalletNetwork,
      AppConfiguration,
      WithdrawalRequests,
      Rate,
    ]),
  ],
  exports: [WalletService, CoinNetworkService, WalletNetworkService],
})
export class WalletModule {}
