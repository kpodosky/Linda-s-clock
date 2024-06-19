import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { PaymentLinkService } from '../service/payment.link.service';
import { ObjectValidationPipe } from '@app/lib/pipe/validation.pipe';
import {
  PaymentLinkValidator,
  SinglePaymentLinkValidator,
  businessCustomerCreateTransactionValidator,
  enableAndDisablePaymentLink,
  initiateCryptoWalletDepositPaymentLink,
  retrieveStringPaymentLink,
  updateWalletDepositPaymentLink,
} from '../validator/payment.link.validator';
import { BusinessTokenDecorator } from '@app/lib/token/decorator/token.decorator';
import {
  BusinessTokenDto,
  RequiredAccountOwnerGuard,
  RequiredKYBGuard,
  RequiredKYCGuard,
  SkipAuthGuard,
} from '@app/lib/token/dto/token.dto';
import {
  CreatePaymentLinkDto,
  EnableAndDisablePaymentLinkDto,
  FilterPaymentLinkDto,
  PaymentLinkDataDto,
  UpdatePaymentLinkDto,
  businessCustomerCreateTransactionDto,
  noBusinessCustomerFilterTransactionDto,
} from '../dto/payment.link.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FileService, multerStorage } from 'src/file/service/file.service';
import { filelocationEnum } from 'src/file/enum/file.enum';
import { CpayBusinessCustomerService } from 'src/business/service/cpay.business.customer.service';
import { Op } from 'sequelize';
import { PaymentLinkTransactionService } from '../service/payment.link.transaction.service';
import {
  WalletCategoryEnum,
  WalletCurrencyEnum,
} from 'src/wallet/enum/wallet.enum';
import { TransactionService } from 'src/transaction/service/transaction.service';
import {
  TransactionCategoryEnum,
  TransactionStatusEnum,
  TransactionTypeEnum,
} from 'src/transaction/enums/transaction.enum';
import { PaymentLinkTransactionValidator } from '../validator/payment.link.transaction.validator';
import { PaymentLinkTransactionFilterDto } from '../dto/payment.link.transaction.dto';
import {
  PaymentLinkCreatePipe,
  PaymentLinkTransactionPipe,
  PaymentLinkUpdatePipe,
} from '../pipe/payment.link.pipe';
import { CpayBusiness } from 'src/business/model/cpay.business.model';
import { RateService } from 'src/rate/service/rate.service';
import { CurrencyEnum } from '@app/lib/enum/country.enum';
import { PaymentLinkStatusEnum } from '../enum/payment.link.enum';
import { CpayBusinessService } from 'src/business/service/cpay.business.service';
import { BussinessAccountStatus } from 'src/business/dto/cpay.user.dto';
import { WalletService } from 'src/wallet/service/wallet.service';
import { CpayBusinessProfile } from 'src/business/model/cpay.business.profile.model';
import { Response } from 'express';
import { CsvService } from '@app/lib/function/cv.generator.service';
import { WalletNetworkService } from 'src/wallet/service/wallet.coin.network.service';
import { Coin } from 'src/wallet/model/coin.model';
import { CoinNetwork } from 'src/wallet/model/coin.network.model';
import { AppConfigService } from 'src/app-config/service/app-config.service';
import { WalletNetwork } from 'src/wallet/model/wallet.coin.network.model';
@Controller('payment')
export class PaymentLinkController {
  constructor(
    private readonly paymentLinkService: PaymentLinkService,
    private readonly fileService: FileService,
    private readonly cpayBusinessCustomerService: CpayBusinessCustomerService,
    private readonly paymentLinkTransactionService: PaymentLinkTransactionService,
    private readonly transactionService: TransactionService,
    private readonly rateService: RateService,
    private readonly cpayBusinessService: CpayBusinessService,
    private readonly walletService: WalletService,
    private readonly csvService: CsvService,
    private readonly walletNetworkService: WalletNetworkService,
    private readonly appConfigService: AppConfigService,
  ) {}

  @Post('create-payment-link')
  @RequiredKYCGuard()
  @RequiredKYBGuard()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'banner' }], {
      dest: './upload',
      storage: multerStorage,
    }),
  )
  async createPaymentLink(
    @Body(
      new ObjectValidationPipe(initiateCryptoWalletDepositPaymentLink),
      PaymentLinkCreatePipe,
    )
    data: CreatePaymentLinkDto,
    @UploadedFiles()
    files: {
      banner: Express.Multer.File;
    },
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    try {
      if (files.banner) {
        const file = await this.fileService.uploadDocument(
          files.banner[0].filename,
          filelocationEnum.profileDocument,
        );
        data.banner = file.secure_url;
      } else {
        throw new ConflictException('Banner image is required');
      }
      const link = this.paymentLinkService.initialize(data);
      console.log('link....', link);
      link.creatorId = token.id;
      await Promise.all([link.save()]);

      return {
        message: 'Link generated successfully',
        data: link,
      };
    } catch (error) {
      console.log(error);
      if (error.response.statusCode < 500) {
        throw new BadRequestException(error.response.message);
      } else {
        throw new InternalServerErrorException(
          'Something went wrong, please try again',
        );
      }
    }
  }

  @Patch('update-payment-link')
  @RequiredKYCGuard()
  @RequiredKYBGuard()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'banner' }], {
      dest: './upload',
      storage: multerStorage,
    }),
  )
  async updatePaymentLink(
    @Body(
      new ObjectValidationPipe(updateWalletDepositPaymentLink),
      PaymentLinkUpdatePipe,
    )
    data: UpdatePaymentLinkDto,
    @UploadedFiles()
    files: {
      banner: Express.Multer.File;
    },
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    const paymentLink = await this.paymentLinkService.findById(
      data.paymentLinkId,
    );
    if (files.banner) {
      const file = await this.fileService.uploadDocument(
        files.banner[0].filename,
        filelocationEnum.profileDocument,
      );
      data.banner = file.secure_url;
    }
    await this.paymentLinkService.findByIdAndUpdate(paymentLink.id, {
      ...data,
    });
    const link = await this.paymentLinkService.findById(data.paymentLinkId);

    return {
      message: 'Link updated successfully',
      data: link,
    };
  }

  @Get('business-payment-links')
  @RequiredKYBGuard()
  async paymentLinks(
    @Query(new ObjectValidationPipe(PaymentLinkValidator))
    query: FilterPaymentLinkDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    return await this.paymentLinkService.search(query);
  }

  @Get('links-export')
  @SkipAuthGuard()
  async paymentLinkExport(
    @Query(new ObjectValidationPipe(PaymentLinkValidator))
    query: FilterPaymentLinkDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
    @Res() res: Response,
  ) {
    const { data: transactions } = await this.paymentLinkService.search(query);
    const typedTransactions: PaymentLinkDataDto[] = transactions;

    const totalRole2 = typedTransactions.map(
      (transaction: PaymentLinkDataDto) => ({
        id: transaction.id,
        Amount: transaction.amount ?? 0,
        Currency: transaction.currency,
        'Variable amount': transaction.variableAmount,
        Coin: 'ngn', // Adjust if necessary
        Description: transaction.description,
        Title: transaction.title,
        URL: transaction.url,
        Status: transaction.status,
      }),
    );

    const timestamp = new Date().getTime();
    const filePath = `${timestamp}-roles.csv`;

    const { fullFilePath } = await this.csvService.writeCsv2(
      filePath,
      totalRole2,
      res,
    );

    // Send the CSV file as a downloadable attachment
    return res.sendFile(fullFilePath);
  }

  @Get('single-link/:url')
  @SkipAuthGuard()
  async paymentLinkForUser(
    @Param(new ObjectValidationPipe(retrieveStringPaymentLink))
    query: FilterPaymentLinkDto,
  ) {
    const data = await this.paymentLinkService.findOne({
      where: {
        url: query.url,
        deletedAt: {
          [Op.is]: null || undefined,
        },
      },
      include: [
        {
          model: Coin,
          as: 'coin',
        },
        {
          model: CpayBusiness,
          as: 'business',
          attributes: ['name'],
        },
      ],
    });
    if (!data) throw new BadRequestException('Invalid payment link');
    const business = await this.cpayBusinessService.findOne({
      where: {
        id: data.businessId,
      },
      include: [
        {
          model: CpayBusinessProfile,
          as: 'profile',
          attributes: ['businessLogo'],
        },
      ],
    });
    if (business && business.businessStatus !== BussinessAccountStatus.Active) {
      throw new BadRequestException('Business has been deactivated');
    }
    if (data && data.status !== PaymentLinkStatusEnum.enabled) {
      throw new BadRequestException('Payment link is no longer active');
    }
    const result = data.toJSON();

    let conversionRate;
    if (result.currency.toLowerCase() === CurrencyEnum.usd.toLowerCase()) {
      conversionRate = 1;
    } else {
      const payableAmount = await this.rateService.findOne({
        where: {
          to: {
            [Op.iLike]: CurrencyEnum.usd.toLowerCase(),
          },
          from: {
            [Op.iLike]: result.currency.toLowerCase(),
          },
        },
      });
      if (!payableAmount) {
        throw new BadRequestException('Operation failed');
      }
      conversionRate = payableAmount.price;
    }

    const amountInUsd = result.amount / conversionRate;

    const cryptoAmount = await this.rateService.findOne({
      where: {
        to: {
          [Op.iLike]: CurrencyEnum.usd.toLowerCase(),
        },
        from: {
          [Op.iLike]: result.coin.name.toLowerCase(),
        },
      },
    });
    if (!cryptoAmount) {
      Logger.error('cryptoAmount.... no cryptoAmount');
      throw new BadRequestException('Operation failed');
    }
    const finalCryptoAmount = cryptoAmount.price * amountInUsd;

    const wallet = await this.walletService.findOne({
      where: {
        businessId: result.businessId,
        currency: result.coin.name.toLowerCase() as any,
        category: WalletCategoryEnum.crypto,
      },
    });
    if (!wallet) {
      throw new BadRequestException('Payment link not available at this time');
    }

    const coinNetworkCheck = await WalletNetwork.findAll({
      where: {
        coinId: result.coin.id,
        businessId: result.businessId,
      },
      include: [
        {
          model: CoinNetwork,
          as: 'network',
        },
      ],
    });
    const businessNetworks = coinNetworkCheck
      .filter((val) => val.network)
      .map((val) => ({
        id: val.network.id,
        name: val.network.name,
        code: val.network.code,
      }));

    const mapResult: noBusinessCustomerFilterTransactionDto = {
      id: result.id,
      currency: result.currency as any,
      variableAmount: result.variableAmount,
      status: result.status as any,
      url: result.url,
      title: result.title,
      redirectUrl: result.redirectUrl,
      description: result.description,
      banner: result.banner,
      businessId: result.businessId,
      coinDetails: {
        id: result.coin.id,
        name: result.coin.name,
        code: result.coin.code,
        image: result.coin.image,
      },
      amount: result.amount,
      payableAmount: parseFloat(finalCryptoAmount.toFixed(3)),
      business: result.business,
      businessLogo: business?.profile?.businessLogo,
      netWorks: businessNetworks,
    };
    return {
      data: mapResult,
    };
  }

  @Patch('enable-and-disable-payment-link')
  @RequiredKYBGuard()
  async disableAndEnablePaymentLink(
    @Body(new ObjectValidationPipe(enableAndDisablePaymentLink))
    details: EnableAndDisablePaymentLinkDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    const paymentLink = await this.paymentLinkService.findById(
      details.paymentLinkId,
    );
    await this.paymentLinkService.findByIdAndUpdate(details.paymentLinkId, {
      status:
        paymentLink.status === PaymentLinkStatusEnum.enabled
          ? PaymentLinkStatusEnum.disabled
          : PaymentLinkStatusEnum.enabled,
    });

    return {
      message: `Payment link ${
        paymentLink.status === PaymentLinkStatusEnum.enabled
          ? PaymentLinkStatusEnum.disabled
          : PaymentLinkStatusEnum.enabled
      } successfully`,
    };
  }

  @Post('create-transaction')
  @SkipAuthGuard()
  async businessCustomerCreateTransaction(
    @Body(
      new ObjectValidationPipe(businessCustomerCreateTransactionValidator),
      PaymentLinkTransactionPipe,
    )
    details: businessCustomerCreateTransactionDto,
  ) {
    const paymentLink = await this.paymentLinkService.findOne({
      where: {
        id: details.paymentLinkId,
      },
    });
    const coinNetwork = await this.walletNetworkService.findOne({
      where: {
        networkId: details.networkId,
        businessId: paymentLink.businessId,
      },
      include: [
        {
          model: Coin,
          as: 'coin',
        },
        {
          model: CoinNetwork,
          as: 'network',
        },
      ],
    });
    let user = await this.cpayBusinessCustomerService.findOne({
      where: {
        email: {
          [Op.iLike]: details.email,
        },
      },
    });
    if (!user) {
      user = await this.cpayBusinessCustomerService.initialize({
        firstName: details.firstName,
        lastName: details.lastName,
        email: details.email,
        businessId: paymentLink.businessId,
        phoneNumber: details.phoneNumber,
      });
      await user.save();
    }
    const wallet = await this.walletService.findOne({
      where: {
        businessId: paymentLink.businessId,
        currency: coinNetwork.coin.name.toLowerCase(),
      },
    });
    if (!coinNetwork) {
      Logger.error('coinNetwork.... not found');
      throw new BadRequestException('Operation failed');
    }
    if (!wallet) {
      throw new BadRequestException(
        'Transaction cannot be completed at the moment',
      );
    }

    let conversionRate;
    if (paymentLink.currency.toLowerCase() === CurrencyEnum.usd.toLowerCase()) {
      conversionRate = 1;
    } else {
      const payableAmount = await this.rateService.findOne({
        where: {
          to: {
            [Op.iLike]: CurrencyEnum.usd.toLowerCase(),
          },
          from: {
            [Op.iLike]: paymentLink.currency.toLowerCase(),
          },
        },
      });
      if (!payableAmount) {
        throw new BadRequestException('Operation failed');
      }
      conversionRate = payableAmount.price;
    }

    const amountInUsd = (1 / conversionRate) * paymentLink.amount;
    const payableAmountRate = await this.rateService.findOne({
      where: {
        to: CurrencyEnum.usd.toLowerCase(),
        from: coinNetwork.coin.name.toLowerCase(),
      },
    });
    if (!payableAmountRate) {
      Logger.error('payableAmountRate.... not found');
      throw new BadRequestException('Operation failed');
    }
    const payableAmountRateUnit = payableAmountRate.price * amountInUsd;

    const reference = this.transactionService.generateReference();
    const config = await this.appConfigService.findOne({
      where: {
        source: 'clockpay',
      },
    });
    const charges = this.transactionService.roundUpToTwoDecimals(
      (config.depositChargesInPercent / 100) * payableAmountRateUnit,
    );
    const transaction = this.transactionService.initialize({
      businessId: paymentLink.businessId,
      type: TransactionTypeEnum.Credit,
      currency: paymentLink.currency as WalletCurrencyEnum,
      amount: paymentLink.amount,
      description: `Inbound ${coinNetwork.coin.name.toUpperCase()} payment for your business from ${details.firstName.toUpperCase()}-${details.lastName.toUpperCase()}`,
      currentBalance: 0,
      reference,
      category: TransactionCategoryEnum.Crypto,
      previousBalance: wallet.availableBalance ?? 0,
      meta: {
        network: coinNetwork.network.name,
        senderEmail: user.email,
        cryptoCurrency: coinNetwork.coin.name.toLowerCase(),
      },
      sender: `${details.firstName} ${details.lastName}`,
      rateInUsd: conversionRate,
      walletId: wallet.id,
      cryptoValue: parseFloat(payableAmountRateUnit.toFixed(3)),
      charges,
    });
    const linkTransaction = this.paymentLinkTransactionService.initialize({
      businessId: paymentLink.businessId,
      amount: paymentLink.amount,
      currency: paymentLink.currency as WalletCurrencyEnum,
      paymentLinkId: paymentLink.id,
      description: `Inbound ${coinNetwork.coin.name.toUpperCase()} payment for your business from ${details.firstName.toUpperCase()}-${details.lastName.toUpperCase()}`,
      senderId: user.id,
      reference,
      previousBalance: wallet.availableBalance ?? 0,
      currentBalance: 0,
      charges: Math.ceil(
        (config.depositChargesInPercent / 100) * paymentLink.amount,
      ),
      transactionId: transaction.id,
      address: coinNetwork.address,
      meta: {
        networkId: coinNetwork.networkId,
        coinId: coinNetwork.coinId,
        cryptoCurrency: coinNetwork.coin.name.toLowerCase(),
      },
    });
    transaction.paymentLinkId = linkTransaction.id;
    await Promise.all([transaction.save(), linkTransaction.save()]);
    return {
      message: `Transaction initiated successfully`,
      data: {
        reference,
        address: coinNetwork.address,
        scanCode: coinNetwork.scanCode,
        network: coinNetwork.network.name,
        contractAddress: coinNetwork.network.contractAddress,
      },
    };
  }

  @Get('business-payment-transactions')
  async paymentLinkTransactions(
    @Query(new ObjectValidationPipe(PaymentLinkTransactionValidator))
    query: PaymentLinkTransactionFilterDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    return await this.paymentLinkTransactionService.search(query);
  }

  @Get('business-payment-links/:businessId/statistics')
  async paymentLinksStatistics(
    @Param(new ObjectValidationPipe(PaymentLinkValidator))
    query: FilterPaymentLinkDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    const paymentLinks = await this.paymentLinkService.count({
      where: {
        businessId: query.businessId,
      },
    });
    const sales = await this.paymentLinkTransactionService.count({
      where: {
        businessId: query.businessId,
        status: TransactionStatusEnum.Success,
      },
    });
    const totalUsdc: any = await this.transactionService.sum('amount', {
      where: {
        status: TransactionStatusEnum.Success,
        businessId: query.businessId,
        category: TransactionCategoryEnum.Crypto,
        type: TransactionTypeEnum.Credit,
        'meta.currencyValue': WalletCurrencyEnum.USDC,
      },
    });
    const totalUsdt: any = await this.transactionService.sum('amount', {
      where: {
        status: TransactionStatusEnum.Success,
        businessId: query.businessId,
        category: TransactionCategoryEnum.Crypto,
        type: TransactionTypeEnum.Credit,
        'meta.currencyValue': WalletCurrencyEnum.USDT,
      },
    });
    const total = this.transactionService.roundUpToTwoDecimals(
      (totalUsdc ?? 0) + (totalUsdt ?? 0),
    );
    return {
      paymentLinks,
      sales,
      revenueInUsd: total,
    };
  }

  @Get('business-payment-links/:businessId/:paymentLinkId/statistics')
  async paymentLinksStatistic(
    @Param(new ObjectValidationPipe(SinglePaymentLinkValidator))
    query: FilterPaymentLinkDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    const paymentLinks = await this.paymentLinkService.count({
      where: {
        businessId: query.businessId,
        id: query.paymentLinkId,
      },
    });
    const sales = await this.paymentLinkTransactionService.count({
      where: {
        businessId: query.businessId,
        status: TransactionStatusEnum.Success,
      },
    });
    const totalusdc: any = await this.transactionService.sum('amount', {
      where: {
        status: TransactionStatusEnum.Success,
        businessId: query.businessId,
        category: TransactionCategoryEnum.Crypto,
        type: TransactionTypeEnum.Credit,
        paymentLinkId: query.paymentLinkId,
        'meta.currencyValue': WalletCurrencyEnum.USDC,
      },
    });
    const totalUsdt: any = await this.transactionService.sum('amount', {
      where: {
        status: TransactionStatusEnum.Success,
        businessId: query.businessId,
        category: TransactionCategoryEnum.Crypto,
        type: TransactionTypeEnum.Credit,
        paymentLinkId: query.paymentLinkId,
        'meta.currencyValue': WalletCurrencyEnum.USDT,
      },
    });
    const total = this.transactionService.roundUpToTwoDecimals(
      (totalusdc ?? 0) + (totalUsdt ?? 0),
    );

    return {
      paymentLinks,
      sales,
      revenueInUsd: total,
    };
  }

  @Delete('account/:paymentLinkId')
  @RequiredAccountOwnerGuard()
  async deleteAccount(
    @Param(new ObjectValidationPipe(SinglePaymentLinkValidator))
    query: FilterPaymentLinkDto,
    @BusinessTokenDecorator()
    token: BusinessTokenDto,
  ) {
    const paymentLink = await this.paymentLinkService.findById(
      query.paymentLinkId,
    );
    const customerBusinesses = await this.cpayBusinessService.findAll({
      where: {
        ownerId: token.id,
      },
    });
    if (customerBusinesses.length > 0) {
      for (const customerbusiness of customerBusinesses) {
        const wallets = await this.walletService.findAll({
          where: {
            businessId: customerbusiness.id,
          },
        });
        for (const wallet of wallets) {
          if (wallet.availableBalance > 1) {
            throw new BadRequestException(
              'Please withdraw a all wallet balances for the businesses you created to continue  ',
            );
          }
        }
      }
    }

    await this.paymentLinkService.findByIdAndUpdate(query.paymentLinkId, {
      deletedAt: new Date(),
    });
    // NOTE: Automatically clear and delete login token
    return {
      message: `Account deleted successfully`,
    };
  }
}
