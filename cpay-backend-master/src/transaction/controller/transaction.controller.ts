import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from '../service/transaction.service';
import {
  CryptoTransactionConfirmationDto,
  ProviderTransactionConfirmationDto,
  TransactionDataDto,
  TransactionFilterDto,
  TransactionVerificationCodeDto,
} from '../dtos/transaction.dto';
import {
  BusinessTransactionFilterValidator,
  BusinessTransactionGraphFilterValidator,
  cryptoTransactionVerificationValidator,
  transactionVerificationCodeValidator,
  transactionVerificationValidator,
  webhookTransactionValidator,
} from '../validator/transaction.validator';
import { ObjectValidationPipe } from '@app/lib/pipe/validation.pipe';
import { BusinessTokenDecorator } from '@app/lib/token/decorator/token.decorator';
import { BusinessTokenDto, SkipAuthGuard } from '@app/lib/token/dto/token.dto';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from '../model/transaction.model';
import { ExcelService } from 'src/file/service/excel.service';
import { Response } from 'express';
import { ClockPayGraphTypeEnum } from '@app/lib/enum/login.enum';
import { NetworkCode, TransactionStatusEnum } from '../enums/transaction.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CpayUserService } from 'src/business/service/cpay.user.service';
import { TransactionEventEnums } from '../event/transaction.event';
import { OtpTypeEnum } from 'src/otp/enums/otp.enum';
import { OtpService } from 'src/otp/services/otp.service';
import { CsvService } from '@app/lib/function/cv.generator.service';
import * as moment from 'moment';
import { PaymentLinkTransactionService } from 'src/payment/service/payment.link.transaction.service';
import { CoinNetworkService } from 'src/wallet/service/coin.network.service';
import {
  CryptoTransactionUpdatePipe,
  WithdrawFromWalletUpdatePipe,
} from '../pipe/transaction.pipe';
import { Coin } from 'src/wallet/model/coin.model';
import { CpayBusinessService } from 'src/business/service/cpay.business.service';
import { CpayBusinessCustomerService } from 'src/business/service/cpay.business.customer.service';
import { WalletService } from 'src/wallet/service/wallet.service';
import { CpayBusinessProfile } from 'src/business/model/cpay.business.profile.model';
import { ConfigService } from '@nestjs/config';
import { FlutterwaveService } from 'src/fluterwave/service/flutterwave.service';
import { BankAccountService } from 'src/bank/service/bank.service';

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly paymentLinkTransactionService: PaymentLinkTransactionService,
    private readonly excelService: ExcelService,
    private readonly cpayUserService: CpayUserService,
    private readonly eventEmitter: EventEmitter2,
    private readonly otpService: OtpService,
    private readonly csvService: CsvService,
    private readonly coinNetworkService: CoinNetworkService,
    private readonly cpayBusinessService: CpayBusinessService,
    private readonly cpayBusinessCustomerService: CpayBusinessCustomerService,
    private readonly walletService: WalletService,
    private readonly configService: ConfigService,
    private readonly flutterwaveService: FlutterwaveService,
    private readonly bankAccountService: BankAccountService,
  ) {}

  @Get('lists')
  @UseGuards()
  async transactions(
    @Query(new ObjectValidationPipe(BusinessTransactionFilterValidator))
    query: TransactionFilterDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    return await this.transactionService.mySearch(query);
  }

  @Post('verify')
  async addCard(
    @Body(new ObjectValidationPipe(transactionVerificationValidator))
    data: ProviderTransactionConfirmationDto,
  ) {
    return {
      message: 'Card added successfully',
      vehicle: data,
    };
  }

  @Post('verify-crypto')
  @SkipAuthGuard()
  async verifyTransaction(
    @Body(
      new ObjectValidationPipe(cryptoTransactionVerificationValidator),
      CryptoTransactionUpdatePipe,
    )
    data: CryptoTransactionConfirmationDto,
  ) {
    try {
      const { trxHash, reference } = data;
      const transaction = await this.transactionService.findOne({
        where: { reference },
      });
      const paymentLinkTrx = await this.paymentLinkTransactionService.findOne({
        where: { reference },
      });
      const network = await this.coinNetworkService.findOne({
        where: {
          id: paymentLinkTrx.meta.networkId,
        },
        include: [
          {
            model: Coin,
            as: 'coin',
          },
        ],
      });
      const business = await this.cpayBusinessService.findOne({
        where: {
          id: paymentLinkTrx.businessId,
        },
        include: [{ model: CpayBusinessProfile, as: 'profile' }],
      });
      const customer = await this.cpayBusinessCustomerService.findById(
        paymentLinkTrx.senderId,
      );
      switch (data.code) {
        case NetworkCode.Optimism:
        case 'ERC20':
        case NetworkCode.Polygon:
        case NetworkCode.Bnb:
          let confirm;
          if (data.code === NetworkCode.Optimism) {
            confirm = await this.transactionService.makeOptimismGetRequest(
              `txhash=${trxHash}`,
            );
          } else if (network.code === 'ERC20') {
            confirm = await this.transactionService.makeEtherScanGetRequest(
              `txhash=${trxHash}`,
            );
          } else if (data.code === NetworkCode.Polygon) {
            confirm = await this.transactionService.makePolygonScanGetRequest(
              `txhash=${trxHash}`,
            );
          } else if (network.code === NetworkCode.Bnb) {
            confirm = await this.transactionService.makeBscScanGetRequest(
              `txhash=${trxHash}`,
            );
          }
          if (confirm.status === '1') {
            await this.walletService.increment(
              {
                where: {
                  businessId: business.id,
                  coinId: network.coin.id,
                },
              },
              {
                availableBalance: +transaction.amount,
                ledgerBalance: +transaction.amount,
              },
            );

            transaction.status = TransactionStatusEnum.Success;
            paymentLinkTrx.status = TransactionStatusEnum.Success;
            paymentLinkTrx.meta.trxHash = trxHash;
            transaction.providerReference = trxHash;
            transaction.meta = { ...transaction.meta, trxHash };
            const wallet = await this.walletService.findOne({
              where: { businessId: business.id, coinId: network.coin.id },
            });
            await Promise.all([paymentLinkTrx.save(), transaction.save()]);

            if (business.profile.email) {
              const emailData = {
                link: `${this.configService.get(
                  'FRONTEND_URL',
                )}/dashboard/payment-page/bid=${business.id}&paymentLinkId=${
                  paymentLinkTrx.paymentLinkId
                }`,
                businessName: business.name,
                email: business.profile.email,
                amount: transaction.amount,
                availableBalance: wallet.availableBalance,
                coin: network.coin.name,
                customerEmail: customer.email,
                fullName: `${customer.firstName} ${customer.lastName}`,
                preview: 'New transaction alert',
                transactionDate:
                  await this.transactionService.dayMonthYearDateFormatter(
                    transaction.updatedAt,
                  ),
                reference: data.reference,
              };
              this.eventEmitter.emitAsync(
                TransactionEventEnums.PAYMENT_LINK_CONFIRMATION_MAIL,
                emailData,
              );
            }
          } else if (confirm.status === '0') {
            transaction.status = TransactionStatusEnum.Failed;
            paymentLinkTrx.status = TransactionStatusEnum.Failed;
            paymentLinkTrx.meta.trxHash = trxHash;
          }
          break;
        case NetworkCode.Tron:
          const trcConfirm =
            await this.transactionService.makeTronScanGetRequest(
              `txhash=${trxHash}`,
            );
          if (trcConfirm.confirmed) {
            await this.walletService.increment(
              {
                where: {
                  businessId: business.id,
                  coinId: network.coin.id,
                },
              },
              {
                availableBalance: +transaction.amount,
                ledgerBalance: +transaction.amount,
              },
            );

            transaction.status = TransactionStatusEnum.Success;
            paymentLinkTrx.status = TransactionStatusEnum.Success;
            paymentLinkTrx.meta.trxHash = trxHash;
            transaction.providerReference = trxHash;
            transaction.meta = { ...transaction.meta, trxHash, trcConfirm };
            const wallet = await this.walletService.findOne({
              where: { businessId: business.id, coinId: network.coin.id },
            });
            await Promise.all([paymentLinkTrx.save(), transaction.save()]);

            if (business.profile.email) {
              const emailData = {
                link: `${this.configService.get(
                  'FRONTEND_URL',
                )}/dashboard/payment-page/bid=${business.id}&paymentLinkId=${
                  paymentLinkTrx.paymentLinkId
                }`,
                businessName: business.name,
                email: 'pauladegbokan@gmail.com',
                amount: transaction.amount,
                availableBalance: wallet.availableBalance,
                coin: network.coin.name,
                customerEmail: customer.email,
                fullName: `${customer.firstName} ${customer.lastName}`,
                preview: 'New transaction alert',
                transactionDate:
                  await this.transactionService.dayMonthYearDateFormatter(
                    transaction.updatedAt,
                  ),
                reference: data.reference,
              };
              this.eventEmitter.emitAsync(
                TransactionEventEnums.PAYMENT_LINK_CONFIRMATION_MAIL,
                emailData,
              );
            }
          } else if (confirm.status === '0') {
            transaction.status = TransactionStatusEnum.Failed;
            paymentLinkTrx.status = TransactionStatusEnum.Failed;
            paymentLinkTrx.meta.trxHash = trxHash;
          }
          break;
        case 'SOL':
          break;
      }
      await Promise.all([paymentLinkTrx.save(), transaction.save()]);

      return {
        message: 'Card added successfully',
        vehicle: data,
      };
    } catch (error) {
      Logger.error('......', error);
    }
  }

  @Get('history-graph')
  @UseGuards()
  async transactionGraph(
    @Query(new ObjectValidationPipe(BusinessTransactionGraphFilterValidator))
    query: TransactionFilterDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    // Define period-based grouping
    let groupAttribute: any;
    let dateFormat: string;
    let periodDuration: moment.unitOfTime.DurationConstructor;

    if (query.period === ClockPayGraphTypeEnum.Day) {
      groupAttribute = Sequelize.fn(
        'date_trunc',
        'day',
        Sequelize.col('createdAt'),
      );
      dateFormat = 'YYYY-MM-DD';
      periodDuration = 'day';
    } else if (query.period === ClockPayGraphTypeEnum.Week) {
      groupAttribute = Sequelize.fn(
        'date_trunc',
        'week',
        Sequelize.col('createdAt'),
      );
      dateFormat = 'YYYY-MM-DD';
      periodDuration = 'week';
    } else if (query.period === ClockPayGraphTypeEnum.Month) {
      groupAttribute = Sequelize.fn(
        'date_trunc',
        'month',
        Sequelize.col('createdAt'),
      );
      dateFormat = 'YYYY-MM';
      periodDuration = 'month';
    } else if (query.period === ClockPayGraphTypeEnum.Year) {
      groupAttribute = Sequelize.fn(
        'date_trunc',
        'year',
        Sequelize.col('createdAt'),
      );
      dateFormat = 'YYYY';
      periodDuration = 'year';
    } else if (query.period === ClockPayGraphTypeEnum.Hour) {
      groupAttribute = Sequelize.fn(
        'date_trunc',
        'hour',
        Sequelize.col('createdAt'),
      );
      dateFormat = 'YYYY-MM-DD HH:00';
      periodDuration = 'hour';
    }

    const queryOptions: any = {
      where: {
        businessId: query.businessId,
        ...(query.type && { type: query.type }),
      },
      attributes: [
        [groupAttribute, 'period'],
        [Sequelize.literal('ROUND(SUM(amount)::numeric, 2)'), 'total_amount'],
      ],
      group: [groupAttribute],
      // order: [Sequelize.literal('period DESC')],
      order: [Sequelize.literal('period ASC')],
    };

    const result: any = await Transaction.findAll(queryOptions);

    const startDate =
      query.period === ClockPayGraphTypeEnum.Hour
        ? moment().startOf('hour')
        : moment(
            result.length > 0 ? result[0].get('period') : new Date(),
          ).startOf(periodDuration);

    const periods: any[] = [];
    for (let i = 0; i < 10; i++) {
      periods.push({
        period: startDate
          .clone()
          .subtract(i, periodDuration)
          .format(dateFormat),
        total_amount: 0,
      });
    }

    const resultMap = new Map(
      result.map((item: any) => [
        moment(item.get('period')).format(dateFormat),
        item.get('total_amount'),
      ]),
    );

    const mergedData = periods.map((periodObj: any) => ({
      period: periodObj.period,
      total_amount: resultMap.get(periodObj.period) || 0,
    }));

    return {
      data: mergedData,
    };
  }

  async exportTransactions(
    @Query(new ObjectValidationPipe(BusinessTransactionFilterValidator))
    query: TransactionFilterDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      query.limit = 10000;
      const transactions = await this.transactionService.mySearch(query);
      const filePath = 'transactions.xlsx';
      await this.excelService.exportTransactionData(
        transactions.data,
        filePath,
      );
      res.download(filePath); // Serve the file for download
    } catch (error) {
      // Handle errors
      console.error('Error exporting transactions:', error);
      res.status(500).send('Error exporting transactions');
    }
  }

  @Post('confirmation/code')
  async confirmationCode(
    @Body(new ObjectValidationPipe(transactionVerificationCodeValidator))
    data: TransactionVerificationCodeDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    const user = await this.cpayUserService.findById(token.id);
    const otp = await this.otpService.findOne({
      where: { type: OtpTypeEnum.transactionConfirmation, receiver: token.id },
    });
    if (!otp) {
      throw new BadRequestException('Invalid verification code');
    }
    await this.otpService.verify({
      code: data.code,
      receiver: user.id,
      type: OtpTypeEnum.transactionConfirmation,
      id: otp.id,
    });
    return {
      message: 'Code confirmed successfully',
    };
  }

  @Get('send/verification/code')
  async sendVerificationCode(
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    const user = await this.cpayUserService.findById(token.id);

    if (user) {
      const emailData = {
        username: user.firstName + ' ' + user.lastName,
        subject: 'Transaction Confirmation OTP',
        email: user.email,
        receiver: user.id,
      };
      this.eventEmitter.emitAsync(
        TransactionEventEnums.SEND_TRANSACTION_CONFIRMATION_CODE,
        emailData,
      );
    }
    return {
      message: 'Confirmation code sent successfully',
    };
  }

  @Get('export')
  async transactionsExport(
    @Query(new ObjectValidationPipe(BusinessTransactionFilterValidator))
    query: TransactionFilterDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
    @Res() res: Response,
  ) {
    const { data: transactions } = await this.transactionService.mySearch(
      query,
    );
    const typedTransactions: TransactionDataDto[] = transactions;

    const totalRole2 = typedTransactions.map(
      (transaction: TransactionDataDto) => ({
        id: transaction.id,
        amount: transaction.amount ?? 0,
        charges: transaction.charges ?? 0,
        rateInUsd: transaction.rateInUsd ?? 0,
        type: transaction.type,
        status: transaction.status,
        currency: transaction.currency,
        category: transaction.category,
      }),
    );

    const timestamp = new Date().getTime();
    const filePath = `${timestamp}-roles.csv`;

    const { fullFilePath } = await this.csvService.writeCsv2(
      filePath,
      totalRole2,
      res,
    );

    return res.sendFile(fullFilePath);
  }

  @Post('webhook-channel-1')
  @SkipAuthGuard()
  async FlutterwaveWebhook(
    @Body(
      new ObjectValidationPipe(webhookTransactionValidator),
      WithdrawFromWalletUpdatePipe,
    )
    customer: any,
  ) {
    try {
      const { event, data } = customer;

      let pendingTrx;
      const response = (await this.flutterwaveService.verifyTransaction(
        event,
        data,
      )) as any;
      if (event === 'transfer.completed') {
        pendingTrx = await this.transactionService.findOne({
          where: {
            trxRef: data.reference,
            status: TransactionStatusEnum.Pending,
          },
        });
      }
      if (!pendingTrx) {
        return { message: 'Transaction not found' };
      }
      const business = await this.cpayBusinessService.findById(
        pendingTrx.businessId,
      );
      if (
        event === 'transfer.completed' &&
        (response.data.data.status === 'SUCCESSFUL' ||
          response.data.data.status === 'NEW')
      ) {
        pendingTrx.status = TransactionStatusEnum.Success;
        pendingTrx.flutterObject = response.data;
        // pendingTrx.charges = Math.floor(data.app_fee * 100)
        await pendingTrx.save();
        const wallet = await this.walletService.findOne({
          where: { businessId: business.id, id: pendingTrx.walletId },
        });
        const bank = await this.bankAccountService.findOne({
          where: { businessId: business.id, currency: pendingTrx.currency },
        });
        if (business.profile.email) {
          const emailData = {
            businessName: business.name,
            email: business.profile.email,
            amount: `${this.transactionService.currencyLogo(
              pendingTrx.currency,
            )}${this.transactionService
              .currencyFormatter()
              .format(pendingTrx.amount)}`,
            availableBalance: `${this.transactionService.currencyLogo(
              pendingTrx.currency,
            )}${this.transactionService
              .currencyFormatter()
              .format(wallet.availableBalance)}`,
            fullName: `${customer.firstName} ${customer.lastName}`,
            preview: 'Success withdrawal Transaction',
            transactionDate:
              await this.transactionService.dayMonthYearDateFormatter(
                pendingTrx.updatedAt,
              ),
            reference: data.reference,
          };
          this.eventEmitter.emitAsync(
            TransactionEventEnums.WITHDRAWAL_CONFIRMATION_MAIL,
            emailData,
          );
        }

        // TODO: CALL THE EMAIL SERVICE
      } else if (
        event === 'transfer.completed' &&
        response.data.data.status === 'FAILED'
      ) {
        pendingTrx.status = TransactionStatusEnum.Failed;
        pendingTrx.flutterObject = response.data.data;
        if (
          response.data.data.complete_message ===
          'DISBURSE FAILED: Insufficient funds in customer wallet'
        ) {
          await this.walletService.increment(
            {
              where: {
                id: pendingTrx.walletId,
              },
            },
            {
              availableBalance: +pendingTrx.amount,
              ledgerBalance: +pendingTrx.amount,
            },
          );
          const wallet = await this.walletService.findOne({
            where: { businessId: business.id, id: pendingTrx.walletId },
          });
        }
        pendingTrx.adminId = 'refunded';
        await pendingTrx.save();
      }

      return { message: 'Confirmed successfully' };
    } catch (error) {
      Logger.debug('FLUTTERWAVE WEBHOOK ERROR LOG', error);
      return { message: 'Something unexpected happened' };
    }
  }
}
