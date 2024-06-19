import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TransactionService } from 'src/transaction/service/transaction.service';
import { Transaction } from 'src/transaction/model/transaction.model';
import { TransactionController } from './controller/transaction.controller';
import { ExcelService } from 'src/file/service/excel.service';
import { TransactionHandler } from './handler/transaction.handler';
import { CpayUserService } from 'src/business/service/cpay.user.service';
import { CpayUser } from 'src/business/model/cpay.user.model';
import { OtpService } from 'src/otp/services/otp.service';
import { Otp } from 'src/otp/model/otp.model';
import { CsvService } from '@app/lib/function/cv.generator.service';
import { PaymentLinkTransactionService } from 'src/payment/service/payment.link.transaction.service';
import { PaymentLinkTransaction } from 'src/payment/model/payment.link.transaction.model';
import { HttpModule } from '@nestjs/axios';
import { CoinNetworkService } from 'src/wallet/service/coin.network.service';
import { CoinNetwork } from 'src/wallet/model/coin.network.model';
import { CpayBusinessService } from 'src/business/service/cpay.business.service';
import { CpayBusinessCustomerService } from 'src/business/service/cpay.business.customer.service';
import { CpayBusinessCustomer } from 'src/business/model/cpay.business.customer.model';
import { CpayBusiness } from 'src/business/model/cpay.business.model';
import { WalletService } from 'src/wallet/service/wallet.service';
import { Wallet } from 'src/wallet/model/wallet.model';
import { WithdrawalRequestService } from 'src/wallet/service/withdrawal.request.service';
import { WithdrawalRequests } from 'src/wallet/model/withdrawal.request.model';
import { BankAccountService } from 'src/bank/service/bank.service';
import { Bank } from 'src/bank/model/bank.model';

@Module({
  controllers: [TransactionController],
  providers: [
    TransactionService,
    ExcelService,
    TransactionHandler,
    CpayUserService,
    OtpService,
    CsvService,
    PaymentLinkTransactionService,
    CoinNetworkService,
    CpayBusinessService,
    CpayBusinessCustomerService,
    WalletService,
    WithdrawalRequestService,
    BankAccountService,
  ],
  imports: [
    HttpModule,
    SequelizeModule.forFeature([
      Transaction,
      CpayUser,
      Otp,
      PaymentLinkTransaction,
      CoinNetwork,
      CpayBusinessCustomer,
      CpayBusiness,
      Wallet,
      WithdrawalRequests,
      Bank,
    ]),
  ],
  exports: [TransactionService],
})
export class TransactionModule {}
