import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppConfigService } from 'src/app-config/service/app-config.service';
import {
  AdminLoginValidator,
  AdminQueryValidator,
  adminConfirmCodeValidator,
  adminDashboardFilterValidator,
  adminFilterUserValidator,
  adminJoinRequestValidator,
  adminPasswordUpdateValidator,
  editAdminProfileVaildator,
  removeAdminMemberValidator,
  userBusinessTrendValidator,
} from '../validator/admin.validator';
import {
  AdminAccessRequestDto,
  AdminDashabordSumFilterDto,
  AdminFilterDto,
  AdminForgotPasswordConfirmDto,
  AdminLoginDto,
  AdminRemoveAccessDto,
  AdminUpdatePasswordDto,
  EditAminPProfileVaildatorDto,
  UserBusinessTrendFilter,
} from '../dto/admin.dto';
import { AdminService } from '../service/admin.service';
import { TransactionService } from 'src/transaction/service/transaction.service';
import {
  AdminTransactionDataDto,
  AdminTransactionFilterDto,
  AdminUpdateWithdrawalRequestDto,
} from 'src/transaction/dtos/transaction.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AdminEventEnums } from '../event/admin.event';
import { WalletService } from 'src/wallet/service/wallet.service';
import {
  AdminAccessRequestPipe,
  AdminConfirm2FACodePipe,
  AdminLoginUserPipe,
} from '../pipe/admin.pipe';
import { AdminRoleService } from '../service/admin.role.service';
import { AddAdminRoleDto, AdminRoleFilterDto } from '../dto/admin.role.dto';
import { AdminAccountStatusEnum } from '../enum/admin.enum';
import { ConfigService } from '@nestjs/config';
import { adminRoleCreateValidator } from '../validator/admin.role.validator';
import { filelocationEnum } from 'src/file/enum/file.enum';
import { FileService, multerStorage } from 'src/file/service/file.service';
import { Op } from 'sequelize';
import { ObjectValidationPipe } from '@app/lib/pipe/validation.pipe';
import { AdminTokenDecorator } from '@app/lib/token/decorator/token.decorator';
import { AdminTokenDto, SkipAuthGuard } from '@app/lib/token/dto/token.dto';
import { CpayBusinessService } from 'src/business/service/cpay.business.service';
import {
  BusinessFilterDto,
  BusinessMemberFilterDto,
} from 'src/business/dto/cpay.business.dto';
import {
  AdminTransactionFilterValidator,
  AdminUpdateWithdrawalValidator,
  withdrawalRequestFilterValidator,
} from 'src/transaction/validator/transaction.validator';
import {
  configUpdatePricesValidator,
  configUpdateTruthyValidator,
} from 'src/app-config/validator/app-config.validator';
import {
  UpdateAppConfigPricesDto,
  UpdateAppConfigTruthyDto,
  FilterAppConfigDto,
} from 'src/app-config/dto/app-config.dto';
import { TokenService } from '@app/lib/token/service/token.service';
import { hashPassword } from '@app/lib/function/password.function';
import {
  AdminBusinessMemberFilterValidator,
  BusinessFilterValidator,
} from 'src/business/validator/cpay.business.validator';
import { CpayUserService } from 'src/business/service/cpay.user.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  createNewRateValidator,
  filterAllRatesValidator,
  updateNewRateValidator,
} from 'src/rate/validator/rate.validator';
import {
  RateCreateDto,
  RateFilterDto,
  RateUpdateDto,
} from 'src/rate/dto/rate.dto';
import { RateService } from 'src/rate/service/rate.service';
import { PaymentLinkService } from 'src/payment/service/payment.link.service';
import {
  AdminFilterNetworkDto,
  FilterPaymentLinkDto,
  PaymentLinkDataDto,
} from 'src/payment/dto/payment.link.dto';
import { AdminPaymentLinkValidator } from 'src/payment/validator/payment.link.validator';
import { AdminUpdatedBusinessStatusValidator } from 'src/business/validator/business.validator';
import { AdminUpdatedBusinessStatusDto } from 'src/business/dto/business.dto';
import {
  AdminWalletAddCallDto,
  AdminWalletUpdateDto,
  BusinessWalletSearchValidatorDto,
} from 'src/wallet/dto/wallet.dto';
import {
  AdminBusinessNetworkNewValidator,
  AdminCreateWalletValidator,
  AdminUpdateWalletParamValidator,
  AdminUpdateWalletValidator,
  AdminUpdateWithdrawalRequestParamValidator,
  WalletSearchValidator,
} from 'src/wallet/validator/wallet.validator';
import {
  FiatWalletCurrencyEnum,
  WalletCategoryEnum,
  WalletCurrencyEnum,
} from 'src/wallet/enum/wallet.enum';
import { PaymentLinkStatusEnum } from 'src/payment/enum/payment.link.enum';
import { PaymentLinkTransactionService } from 'src/payment/service/payment.link.transaction.service';
import {
  TransactionCategoryEnum,
  TransactionStatusEnum,
  TransactionTypeEnum,
  WithdrawalRequestsEnum,
} from 'src/transaction/enums/transaction.enum';
import { Response } from 'express';
import { CsvService } from '@app/lib/function/cv.generator.service';
import { WalletNetworkService } from 'src/wallet/service/wallet.coin.network.service';
import { CoinNetworkService } from 'src/wallet/service/coin.network.service';
import { CoinService } from 'src/wallet/service/coin.service';
import { CoinFilterDto, CreateCoinDto } from 'src/wallet/dto/coin.dto';
import {
  adminCreateCoinValidator,
  adminCreateCoinWalletValidator,
  adminUpdateCoinNetworkValidator,
  coinSearchValidator,
} from 'src/wallet/validator/coin.validator';
import {
  CreateCoinNetworkDto,
  UpdateCoinNetworkDto,
} from 'src/wallet/dto/coin.network.dto';
import { CreateWalletCoinNetworkDto } from 'src/wallet/dto/wallet.coin.network.dto';
import { WalletNetwork } from 'src/wallet/model/wallet.coin.network.model';
import { CoinNetwork } from 'src/wallet/model/coin.network.model';
import { Coin } from 'src/wallet/model/coin.model';
import { WithdrawalRequestService } from 'src/wallet/service/withdrawal.request.service';
import { FlutterwaveService } from 'src/fluterwave/service/flutterwave.service';
import { walletWithdrawalRequestFilterDto } from 'src/wallet/dto/withdrawal.request.dto';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly transactionService: TransactionService,
    private readonly appConfigService: AppConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly walletService: WalletService,
    private readonly adminRoleService: AdminRoleService,
    private readonly configService: ConfigService,
    private readonly fileService: FileService,
    private readonly cpayBusinessService: CpayBusinessService,
    private readonly tokenService: TokenService,
    private readonly cpayUserService: CpayUserService,
    private readonly walletNetworkService: WalletNetworkService,
    private readonly coinService: CoinService,
    private readonly rateService: RateService,
    private readonly paymentLinkService: PaymentLinkService,
    private readonly coinNetworkService: CoinNetworkService,
    private readonly paymentLinkTransactionService: PaymentLinkTransactionService,
    private readonly csvService: CsvService,
    private readonly withdrawalRequestService: WithdrawalRequestService,
    private readonly flutterwaveService: FlutterwaveService,
  ) {}

  @Get('dashboard-sum')
  async dashboardStat(
    @Query(new ObjectValidationPipe(adminDashboardFilterValidator))
    query: AdminDashabordSumFilterDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    const where: any = {};
    const options: any = { page: query.page, limit: query.limit, where };
    if (query.startDate) {
      where.createdAt = {
        ...where.createdAt,
        [Op.gte]: query.startDate,
      };
    }

    if (query.endDate) {
      where.createdAt = {
        ...where.createdAt,
        [Op.lte]: query.endDate,
      };
    }
    const totalNgnTransaction = await this.transactionService.sum('amount', {
      ...options,
      where: {
        status: TransactionStatusEnum.Success,
        currency: WalletCurrencyEnum.NGN,
      },
    });
    const totalUsdTransaction = await this.transactionService.sum('amount', {
      ...options,
      where: {
        status: TransactionStatusEnum.Success,
        currency: WalletCurrencyEnum.USD,
      },
    });
    const totalTransaction =
      (totalNgnTransaction ?? 0) + (totalUsdTransaction ?? 0);
    const totalBusinesses = await this.cpayBusinessService.count({
      ...options,
    });
    const totalPaymentLinks = await this.paymentLinkService.count({
      ...options,
    });
    const totalActivePaymentLinks = await this.paymentLinkService.count({
      status: PaymentLinkStatusEnum.enabled,
      ...options,
    });
    const totalActiveUsdcPaymentLinkPayments =
      await this.transactionService.sum('cryptoValue', {
        where: {
          status: TransactionStatusEnum.Success,
          category: TransactionCategoryEnum.Crypto,
          type: TransactionTypeEnum.Credit,
          'meta.cryptoCurrency': WalletCurrencyEnum.USDC,
        },
      });
    const totalActiveUsdtPaymentLinkPayments =
      await this.transactionService.sum('cryptoValue', {
        where: {
          status: TransactionStatusEnum.Success,
          category: TransactionCategoryEnum.Crypto,
          type: TransactionTypeEnum.Credit,
          'meta.cryptoCurrency': WalletCurrencyEnum.USDT,
        },
      });
    const totalActivePaymentLinkPayments =
      (totalActiveUsdcPaymentLinkPayments ?? 0) +
      (totalActiveUsdtPaymentLinkPayments ?? 0);
    const totalWithdrawals = await this.transactionService.sum('amount', {
      ...options,
      type: TransactionTypeEnum.Debit,
    });
    return {
      totalTransaction: {
        amount:
          (await this.transactionService.roundUpToTwoDecimals(
            totalTransaction,
          )) ?? 0,
        percentage: 0,
      },
      totalBusinesses: {
        count: totalBusinesses ?? 0,
        percentage: 0,
      },
      totalPaymentLinks: {
        amount: totalPaymentLinks ?? 0,
        percentage: 0,
      },
      totalActivePaymentLinks: {
        count: totalActivePaymentLinks ?? 0,
        percentage: 0,
      },
      totalActivePaymentLinkTransactions: {
        amount:
          (await this.transactionService.roundUpToTwoDecimals(
            totalActivePaymentLinkPayments,
          )) ?? 0,
        percentage: 0,
      },
      totalWithdrawals: {
        amount: totalWithdrawals
          ? await this.transactionService.roundUpToTwoDecimals(totalWithdrawals)
          : 0,
        percentage: 0,
      },
    };
  }

  @Get('wallet-balances')
  async walletSum(@AdminTokenDecorator() token: AdminTokenDto) {
    return await this.walletService.walletSum();
  }

  @Get('user-business-trend')
  async userBusinessTrend(
    @Query(new ObjectValidationPipe(userBusinessTrendValidator))
    query: UserBusinessTrendFilter,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    return await this.adminService.userBusinessTrends(query);
  }

  @Get('businesses')
  async businessesSearch(
    @Query(new ObjectValidationPipe(BusinessFilterValidator))
    query: BusinessFilterDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    return await this.cpayBusinessService.search(query);
  }

  @Get('business-members')
  async businessMemberSearch(
    @Query(new ObjectValidationPipe(AdminBusinessMemberFilterValidator))
    query: BusinessMemberFilterDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    return await this.cpayUserService.search(query);
  }

  @Get('business-customers')
  async businessCustomersSearch(
    @Query(new ObjectValidationPipe(BusinessFilterValidator))
    query: BusinessFilterDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    return await this.cpayBusinessService.search(query);
  }

  @Get('wallets')
  async businessWallets(
    @Query(new ObjectValidationPipe(WalletSearchValidator))
    query: BusinessWalletSearchValidatorDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    return await this.walletService.adminSearch(query);
  }

  @Get('wallet-networks')
  async walletNetworks(
    @Query(new ObjectValidationPipe(AdminBusinessNetworkNewValidator))
    data: AdminFilterNetworkDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    const result = await this.walletService.findById(data.walletId);
    const coinNetworkCheck = await WalletNetwork.findAll({
      where: {
        coinId: result.coinId,
        businessId: result.businessId,
        ...data,
      },
      include: [
        {
          model: CoinNetwork,
          as: 'network',
        },
        {
          model: Coin,
          as: 'coin',
        },
      ],
    });
    // return { coinNetworkCheck };
    const businessNetworks = coinNetworkCheck
      .filter((val) => val.network) // Filter out elements without a network
      .map((val) => ({
        id: val.network.id,
        name: val.network.name,
        code: val.network.code,
        address: val.address,
        scanCode: val.scanCode,
        coin: val.coin.name,
        coinId: val.coin.id,
        active: val.active,
      }));

    return { message: 'Successfully retrieved', data: businessNetworks };
  }

  @Post('wallet/add')
  @UseGuards()
  async addWallet(
    @Body(new ObjectValidationPipe(AdminCreateWalletValidator))
    data: AdminWalletAddCallDto,

    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    await this.cpayBusinessService.findById(data.businessId);
    const coin = await this.coinService.findOne({
      where: {
        id: data.coinId,
      },
    });
    if (!coin) {
      throw new BadRequestException('Invalid coin selected');
    }

    const walletExist = await this.walletService.findOne({
      where: {
        coinId: data.coinId,
        businessId: data.businessId,
      },
    });
    if (walletExist) {
      throw new BadRequestException(
        `${walletExist.currency.toUpperCase()} wallet already exists for this account`,
      );
    }

    const wallet = this.walletService.initialize({
      ...data,
      currency: coin.name as WalletCurrencyEnum,
      name: coin.name,
      icon: coin.image,
      category: WalletCategoryEnum.crypto,
    });
    const coinNetworks = await this.coinNetworkService.findAll({
      where: {
        coinId: data.coinId,
        tag: data.tag,
      },
    });
    if (coinNetworks.length > 0) {
      for (let i = 0; i < coinNetworks.length; i++) {
        const coinNetwork = await this.createCoinNetwork(
          data.businessId,
          data.coinId,
          data.address,
          wallet.id,
          coinNetworks[i].id,
        );
        await coinNetwork.save();
      }
    }
    await wallet.save();

    return {
      message: 'Wallet added successfully',
      data,
    };
  }

  @Patch('wallet/:walletId/update')
  @UseGuards()
  async updateWallet(
    @Param(new ObjectValidationPipe(AdminUpdateWalletParamValidator))
    param: AdminWalletUpdateDto,
    @Body(new ObjectValidationPipe(AdminUpdateWalletValidator))
    data: AdminWalletUpdateDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    const wallet = await this.walletService.findById(param.walletId);
    const coinNetworks = await this.coinNetworkService.findAll({
      where: {
        coinId: wallet.coinId,
        tag: data.tag,
      },
    });
    for (let i = 0; i < coinNetworks.length; i++) {
      const businessCoinNetworks = await this.walletNetworkService.findOne({
        where: {
          businessId: wallet.businessId,
          coinId: wallet.coinId,
          networkId: coinNetworks[i].id,
        },
      });

      if (businessCoinNetworks) {
        await this.updateCoinNetworkSingle(
          businessCoinNetworks.id,
          data.address,
        );
      } else {
        const coinNetwork = await this.createCoinNetwork(
          wallet.businessId,
          wallet.coinId,
          data.address,
          wallet.id,
          coinNetworks[i].id,
        );
        await coinNetwork.save();
      }
    }

    return {
      message: 'Wallet updated successfully',
    };
  }

  private async createCoinNetwork(
    businessId: string,
    coinId: string,
    address: any,
    walletId: string,
    networkId: string,
  ): Promise<any> {
    const qrCode = await this.transactionService.generateQR(address);

    const uploadedFile = await this.fileService.uploadDocumentBase64(
      qrCode,
      filelocationEnum.profileDocument,
    );
    const networkData: CreateWalletCoinNetworkDto = {
      businessId,
      coinId,
      address,
      scanCode: uploadedFile.secure_url,
      walletId,
      networkId,
    };
    return this.walletNetworkService.initialize(networkData);
  }

  private async updateCoinNetworkSingle(
    coinNetworkId: string,
    address: any,
  ): Promise<any> {
    const qrCode = await this.transactionService.generateQR(address);
    const uploadedFile = await this.fileService.uploadDocumentBase64(
      qrCode,
      filelocationEnum.profileDocument,
    );

    await this.walletNetworkService.findByIdAndUpdate(coinNetworkId, {
      address,
      scanCode: uploadedFile.secure_url,
    });
  }

  @Patch('business/activate-and-deactivate')
  @UseGuards()
  async activateAndDeactivateBusiness(
    @Body(new ObjectValidationPipe(AdminUpdatedBusinessStatusValidator))
    data: AdminUpdatedBusinessStatusDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    const admin = await this.adminService.findById(token.id);

    await this.cpayBusinessService.findByIdAndUpdate(data.businessId, {
      businessStatus: data.businessStatus,
    });
    const activityDetails = {
      adminId: token.id,
      action: `Business Account Update`,
      description: `Update business account as ${data.businessStatus}`,
    };
    this.eventEmitter.emitAsync(
      AdminEventEnums.LOG_ADMIN_ACTIVITY,
      activityDetails,
    );
    // Return the message, user, and the array of created vehicles
    return {
      message: 'Business status updated successfully',
    };
  }

  @Get('transactions')
  async transactions(
    @Query(new ObjectValidationPipe(AdminTransactionFilterValidator))
    query: AdminTransactionFilterDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    return await this.transactionService.search(query);
  }

  @Get('transactions-export')
  async transactionsExport(
    @Query(new ObjectValidationPipe(AdminTransactionFilterValidator))
    query: AdminTransactionFilterDto,
    @AdminTokenDecorator() token: AdminTokenDto,
    @Res() res: Response,
  ) {
    const { data: transactions } = await this.transactionService.search(query);
    const typedTransactions: AdminTransactionDataDto[] = transactions;

    const totalRole2 = typedTransactions.map(
      (transaction: AdminTransactionDataDto) => ({
        id: transaction.id,
        Amount: transaction.amount ?? 0,
        Charges: transaction.charges ?? 0,
        'Current Balance': transaction.currentBalance ?? 0,
        'Previous Balance': transaction.previousBalance ?? 0,
        'Rate in USD': transaction.rateInUsd ?? 0,
        Type: transaction.type,
        Status: transaction.status,
        Currency: transaction.currency,
        Category: transaction.category,
      }),
    );

    const timestamp = new Date().getTime();
    const filePath = `${timestamp}-roles.csv`;

    const { fullFilePath } = await this.csvService.writeCsv2(
      filePath,
      totalRole2,
      res,
    );
    const activityDetails = {
      adminId: token.id,
      action: `File Export`,
      description: `Exported transaction data`,
    };
    this.eventEmitter.emitAsync(
      AdminEventEnums.LOG_ADMIN_ACTIVITY,
      activityDetails,
    );

    // Send the CSV file as a downloadable attachment
    return res.sendFile(fullFilePath);
  }

  @Get('app-config')
  async getConfig(
    data: FilterAppConfigDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    const config = await this.appConfigService.findOne({
      where: {
        source: 'clockpay',
      },
    });
    return { message: 'Config retrieved successfully', data: config };
  }

  // @Post('create-config')
  // @UseGuards()
  // async createReview(
  //   @Body(new ObjectValidationPipe(configCreatePricesValidator))
  //   data: CreateAppConfigDto,
  //   @AdminTokenDecorator() token: AdminTokenDto,
  // ) {
  //   // TODO: Restrict setting to administrator account only.
  //   let configExists = await this.appConfigService.findOne({
  //     where: {
  //       source: 'clockpay',
  //     },
  //   });
  //   if (!configExists) {
  //     configExists = await this.appConfigService.initialize({
  //       ...data,
  //     });
  //   }
  //   await configExists.save();
  //   // TODO: send account verification email
  //   return { message: 'Config created successfully', data: configExists };
  // }

  @Patch('update-config-prices')
  async updateConfigPrices(
    @Body(new ObjectValidationPipe(configUpdatePricesValidator))
    details: UpdateAppConfigPricesDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    // TODO: Restrict setting to administrator account only.
    await this.appConfigService.findOneAndUpdate(
      {
        source: 'clockpay',
      },
      {
        [details.key]: details.value,
      },
    );
    const activityDetails = {
      adminId: token.id,
      action: `Config Price Update`,
      description: `Updated configuration price for ${details.key}`,
    };
    this.eventEmitter.emitAsync(
      AdminEventEnums.LOG_ADMIN_ACTIVITY,
      activityDetails,
    );
    return {
      message: `${details.key} updated successfully`,
    };
  }

  @Patch('update-config-boolean')
  async updateConfig(
    @Body(new ObjectValidationPipe(configUpdateTruthyValidator))
    details: UpdateAppConfigTruthyDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    // TODO: Restrict setting to administrator account only.
    await this.appConfigService.findOneAndUpdate(
      {
        source: 'clockpay',
      },
      {
        [details.key]: details.value,
      },
    );
    const activityDetails = {
      adminId: token.id,
      action: `Config Price Update`,
      description: `Updated configuration price for ${details.key}`,
    };
    this.eventEmitter.emitAsync(
      AdminEventEnums.LOG_ADMIN_ACTIVITY,
      activityDetails,
    );
    return {
      message: `${details.value} updated successfully`,
    };
  }

  @Post('add-new-member')
  @UseGuards()
  async addNewTeamMember(
    @Body(
      new ObjectValidationPipe(adminJoinRequestValidator),
      AdminAccessRequestPipe,
    )
    data: AdminAccessRequestDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    const superAdmin = await this.adminService.findById(token.id);
    let admin;
    admin = await this.adminService.findOne({
      where: { email: data.email },
    });
    if (!admin) {
      admin = this.adminService.initialize({
        ...data,
        invitedBy: superAdmin.fullName,
      });
      admin.save();
    }
    const role = await this.adminRoleService.findById(admin.roleId);
    const link = `${this.configService.get(
      'ADMIN_DASHBOARD_URL',
    )}/update-password/${admin.id}?email=${admin.email}`;
    const emailData = {
      subject: `Clockpay Admin Invitation`,
      email: data.email,
      link,
      role: role.title,
      preview: 'Admin Invite',
    };
    this.eventEmitter.emitAsync(
      AdminEventEnums.SEND_REQUEST_ACCESS_MAIL,
      emailData,
    );

    const activityDetails = {
      adminId: token.id,
      action: `Admin Access`,
      description: `${superAdmin.fullName} sent admin access to ${data.email}`,
    };
    this.eventEmitter.emitAsync(
      AdminEventEnums.LOG_ADMIN_ACTIVITY,
      activityDetails,
    );

    return {
      message: 'Request sent successfully',
    };
  }

  @Post('remove-member')
  @UseGuards()
  async removeTeamMember(
    @Body(new ObjectValidationPipe(removeAdminMemberValidator))
    data: AdminRemoveAccessDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    const admin = await this.adminService.findById(token.id);
    const admin2 = await this.adminService.findById(data.memberId);
    await this.adminService.findByIdAndUpdate(data.memberId, {
      deletedAt: new Date(),
    });

    const activityDetails = {
      adminId: token.id,
      action: `Admin Access`,
      description: `${admin.fullName} removed ${admin2.fullName} ${admin2.email} from admin`,
    };
    this.eventEmitter.emitAsync(
      AdminEventEnums.LOG_ADMIN_ACTIVITY,
      activityDetails,
    );

    return {
      message: 'Admin removed successfully',
    };
  }

  @Post('access/update-password')
  @SkipAuthGuard()
  async updatePasswordOnRequestAccess(
    @Body(new ObjectValidationPipe(adminPasswordUpdateValidator))
    customer: AdminUpdatePasswordDto,
  ) {
    const admin = await this.adminService.findById(customer.adminId);
    const activityDetails = {
      adminId: admin.id,
      action: `Password update attempt`,
      description: `${admin.fullName} updated password`,
    };
    this.eventEmitter.emitAsync(
      AdminEventEnums.LOG_ADMIN_ACTIVITY,
      activityDetails,
    );
    if (admin.status !== AdminAccountStatusEnum.Pending) {
      throw new BadRequestException('Request cannot be completed.');
    }
    admin.status = AdminAccountStatusEnum.Accepted;
    admin.password = await hashPassword(customer.password);
    await admin.save();
    // TODO: Confirm if user needs to get a confirmation email
    return {
      message: 'Password updated successfully',
    };
  }

  @Get('lists')
  @UseGuards()
  async AllAdmin(
    @Query(new ObjectValidationPipe(AdminQueryValidator))
    query: AdminFilterDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    const activityDetails = {
      adminId: token.id,
      action: `Retrieved all admin users`,
    };
    // this.eventEmitter.emitAsync(
    //   AdminEventEnums.REGISTER_ADMIN_ACTIVITY,
    //   activityDetails,
    // );
    return await this.adminService.search(query);
  }

  @Get('role/lists')
  async adminList(
    @Query(new ObjectValidationPipe(adminFilterUserValidator))
    query: AdminRoleFilterDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    return await this.adminRoleService.search(query);
  }

  @Post('role/create')
  @UseGuards()
  async createRole(
    @Body(new ObjectValidationPipe(adminRoleCreateValidator))
    data: AddAdminRoleDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    const admin = await this.adminService.findById(token.id);
    const role = this.adminRoleService.initialize(data);
    await role.save();
    const activityDetails = {
      adminId: token.id,
      action: `New Admin Role`,
      description: `${admin.fullName} created a new admin role: ${data.title}`,
    };
    this.eventEmitter.emitAsync(
      AdminEventEnums.LOG_ADMIN_ACTIVITY,
      activityDetails,
    );

    return {
      message: 'Role added successfully',
    };
  }

  @Post('authentication/login')
  @SkipAuthGuard()
  async login(
    @Body(new ObjectValidationPipe(AdminLoginValidator), AdminLoginUserPipe)
    data: AdminLoginDto,
  ) {
    const admin = await this.adminService.findOne({
      where: {
        email: {
          [Op.iLike]: data.email,
        },
      },
      attributes: {
        include: ['password'],
      },
    });
    const token = await this.tokenService.admintokenize({
      data: {
        id: admin.id,
        email: admin.email,
        role: admin.roleId,
      },
    });
    await this.adminService.findByIdAndUpdate(admin.id, {
      lastToken: token,
      validFactorAuth: false,
    });
    admin.lastToken = token;
    await admin.save();
    admin.password = undefined;
    admin.lastToken = undefined;
    const activityDetails = {
      adminId: admin.id,
      action: `Successful Login`,
      description: `${admin.fullName} logged in successfully`,
    };
    this.eventEmitter.emitAsync(
      AdminEventEnums.LOG_ADMIN_ACTIVITY,
      activityDetails,
    );

    const adminDetails = {
      username: admin.fullName,
      title: 'Admin 2FA Verification Code',
      email: admin.email,
      receiver: admin.id,
    };
    // this.eventEmitter.emitAsync(
    //   AdminEventEnums.SEND_2FA_VERIFICATION_CODE,
    //   adminDetails,
    // );

    // TODO: send account verification email and any other data manipulation happens here...
    return {
      data: admin,
      token,
    };
  }

  @Post('confirm-2fa')
  async confirm2FA(
    @Body(
      new ObjectValidationPipe(adminConfirmCodeValidator),
      AdminConfirm2FACodePipe,
    )
    admin: AdminForgotPasswordConfirmDto,
  ) {
    await this.adminService.findByIdAndUpdate(admin.adminId, {
      validFactorAuth: true,
    });
    return {
      message: 'OTP confirmed successfully',
    };
  }

  @Post('resend-2fa')
  async resend2Fa(@AdminTokenDecorator() token: AdminTokenDto) {
    const admin = await this.adminService.findById(token.id);

    const adminDetails = {
      username: admin.fullName,
      message: 'Admin 2FA Verification Code',
      email: admin.email,
      receiver: admin.id,
    };
    this.eventEmitter.emitAsync(
      AdminEventEnums.SEND_2FA_VERIFICATION_CODE,
      adminDetails,
    );
    // this.eventEmitter.emitAsync(
    //   AdminEvent.REGISTER_ADMIN_ACTIVITY,
    //   activityDetails,
    // );
    // Return the message, user, and the array of created vehicles
    return {
      message: 'OTP confirmed successfully',
    };
  }

  @Get('profile')
  @UseGuards()
  async profile(@AdminTokenDecorator() token: AdminTokenDto) {
    const admin = await this.adminService.findById(token.id);
    // Return the message, user, and the array of created vehicles
    return {
      message: 'Profile retrieved successfully',
      data: admin,
    };
  }

  @Patch('edit-profile')
  @UseGuards()
  async editProfile(
    @Body(new ObjectValidationPipe(editAdminProfileVaildator))
    data: EditAminPProfileVaildatorDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    const admin = await this.adminService.findById(token.id);
    if (data.profilePicture) {
      const file = await this.fileService.uploadDocument(
        data.profilePicture,
        filelocationEnum.profileDocument,
      );
      data.profilePicture = file.secure_url;
    }
    await this.adminService.findByIdAndUpdate(token.id, {
      ...admin,
      ...data,
    });
    const activityDetails = {
      adminId: admin.id,
      action: `Edited account profile`,
      description: `${admin.fullName} edited account profile successfully`,
    };
    this.eventEmitter.emitAsync(
      AdminEventEnums.LOG_ADMIN_ACTIVITY,
      activityDetails,
    );
    return {
      message: 'Profile updated successfully',
    };
  }

  @Post('coin/create')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'image' }], {
      dest: './upload',
      storage: multerStorage,
    }),
  )
  @UseGuards()
  async addCoin(
    @Body(new ObjectValidationPipe(adminCreateCoinValidator))
    data: CreateCoinDto,
    @UploadedFiles()
    files: {
      image: Express.Multer.File;
    },
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    const admin = await this.adminService.findById(token.id);

    const coin = await this.coinService.findOne({
      where: {
        name: {
          [Op.iLike]: data.name,
        },
      },
    });
    if (!coin) {
      if (files.image) {
        const file = await this.fileService.uploadDocument(
          files.image[0].filename,
          filelocationEnum.profileDocument,
        );
        data.image = file.secure_url;
      } else {
        throw new BadRequestException('Coin image is required');
      }
      const coin = this.coinService.initialize(data);
      await coin.save();
    } else {
      throw new BadRequestException('Coin already exists');
    }
    const activityDetails = {
      adminId: admin.id,
      action: `Added New Coin`,
      description: `${admin.fullName} added a new coin: ${data.name}`,
    };
    this.eventEmitter.emitAsync(
      AdminEventEnums.LOG_ADMIN_ACTIVITY,
      activityDetails,
    );

    return {
      message: 'Coin added successfully',
    };
  }

  @Get('coin/lists')
  async coinList(
    @Query(new ObjectValidationPipe(coinSearchValidator))
    query: CoinFilterDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    return await this.coinService.adminSearch(query);
  }

  @Post('coin/network/create')
  @UseGuards()
  async addCoinNetwork(
    @Body(new ObjectValidationPipe(adminCreateCoinWalletValidator))
    data: CreateCoinNetworkDto,
    @AdminTokenDecorator()
    token: AdminTokenDto,
  ) {
    const admin = await this.adminService.findById(token.id);

    const network = this.coinNetworkService.initialize(data);
    await network.save();
    const activityDetails = {
      adminId: admin.id,
      action: `Added New Coin Network`,
      description: `${admin.fullName} added a new coin network: ${data.name} for ${data.coinId}`,
    };
    this.eventEmitter.emitAsync(
      AdminEventEnums.LOG_ADMIN_ACTIVITY,
      activityDetails,
    );

    return {
      message: 'Coin network added successfully',
    };
  }

  @Patch('coin/network/update')
  @UseGuards()
  async updateCoinNetwork(
    @Body(new ObjectValidationPipe(adminUpdateCoinNetworkValidator))
    data: UpdateCoinNetworkDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    const admin = await this.adminService.findById(token.id);

    await this.coinNetworkService.findByIdAndUpdate(data.networkId, {
      ...data,
    });
    const activityDetails = {
      adminId: admin.id,
      action: `Updated Coin Network`,
      description: `${admin.fullName} updated coin network: ${data.name} for ${data.coinId} details`,
    };
    this.eventEmitter.emitAsync(
      AdminEventEnums.LOG_ADMIN_ACTIVITY,
      activityDetails,
    );
    return {
      message: 'Coin network updated successfully',
    };
  }

  @Post('rate/create')
  @UseGuards()
  async addRate(
    @Body(new ObjectValidationPipe(createNewRateValidator))
    data: RateCreateDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    const admin = await this.adminService.findById(token.id);

    const rate = this.rateService.initialize(data);
    await rate.save();
    const activityDetails = {
      adminId: admin.id,
      action: `Added New Currency Pairs`,
      description: `${admin.fullName} added new currency pairs. from: ${data.from} to: ${data.to}`,
    };
    this.eventEmitter.emitAsync(
      AdminEventEnums.LOG_ADMIN_ACTIVITY,
      activityDetails,
    );

    return {
      message: 'Rate added successfully',
    };
  }

  @Patch('rate/update')
  @UseGuards()
  async updateRate(
    @Body(new ObjectValidationPipe(updateNewRateValidator))
    data: RateUpdateDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    const admin = await this.adminService.findById(token.id);

    await this.rateService.findByIdAndUpdate(data.rateId, {
      ...data,
    });

    const activityDetails = {
      adminId: admin.id,
      action: `Update Currency Pairs Prices`,
      description: `${admin.fullName} updated rate for ${data.rateId} as ${data.price}`,
    };
    this.eventEmitter.emitAsync(
      AdminEventEnums.LOG_ADMIN_ACTIVITY,
      activityDetails,
    );

    return {
      message: 'Rate updated successfully',
    };
  }

  @Get('rate/all')
  async allRates(
    @Query(new ObjectValidationPipe(filterAllRatesValidator))
    query: RateFilterDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    return await this.rateService.search(query);
  }

  @Get('payment-links')
  async allPaymentLink(
    @Query(new ObjectValidationPipe(AdminPaymentLinkValidator))
    query: FilterPaymentLinkDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    return await this.paymentLinkService.adminSearch(query);
  }

  @Get('payment-links-export')
  async paymentLinkExport(
    @Query(new ObjectValidationPipe(AdminPaymentLinkValidator))
    query: FilterPaymentLinkDto,
    @AdminTokenDecorator() token: AdminTokenDto,
    @Res() res: Response,
  ) {
    const { data: transactions } = await this.paymentLinkService.search(query);
    const typedTransactions: PaymentLinkDataDto[] = transactions;

    const totalRole2 = typedTransactions.map(
      (transaction: PaymentLinkDataDto) => ({
        id: transaction.id,
        Amount: transaction.amount ?? 0,
        Currency: transaction.currency,
        'Variable Amount': transaction.variableAmount,
        // coin: transaction.coin.name as any,
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

  @Get('withdrawal-requests')
  async withdrawalRequest(
    @Query(new ObjectValidationPipe(withdrawalRequestFilterValidator))
    query: walletWithdrawalRequestFilterDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    // TODO: Restrict setting to administrator account only.
    const activityDetails = {
      adminId: token.id,
      action: `Retrieved all withdrawal requests`,
    };
    // this.eventEmitter.emitAsync(
    //   AdminEventEnums.REGISTER_ADMIN_ACTIVITY,
    //   activityDetails,
    // );
    return await this.withdrawalRequestService.search(query);
    // TODO: send account verification email
  }

  @Patch('withdraw/:requestId/update')
  @UseGuards()
  async updateWithdrawalRequest(
    @Param(new ObjectValidationPipe(AdminUpdateWithdrawalRequestParamValidator))
    param: AdminUpdateWithdrawalRequestDto,
    @Body(new ObjectValidationPipe(AdminUpdateWithdrawalValidator))
    data: AdminUpdateWithdrawalRequestDto,
    @AdminTokenDecorator() token: AdminTokenDto,
  ) {
    const request = await this.withdrawalRequestService.findById(
      param.requestId,
    );
    const requestTransaction = await this.transactionService.findOne({
      where: {
        reference: request.reference,
      },
    });
    if (request.status !== WithdrawalRequestsEnum.pending) {
      throw new BadRequestException(
        'Request is either invalid or has been previously updated',
      );
    }
    if (requestTransaction.status !== TransactionStatusEnum.Pending) {
      throw new BadRequestException(
        'Request is either invalid or has been previously updated',
      );
    }
    if (request.currency === FiatWalletCurrencyEnum.NGN) {
      const initiate =
        await this.flutterwaveService.initiateFlutterwaveTransaction(
          '/transfers',
          {
            account_bank: request.bankCode,
            account_number: request.accountNumber,
            amount: request.amount,
            narration: requestTransaction.description,
            currency: request.currency.toUpperCase(),
            reference: request.reference,
            beneficiary_name: request.name,
          },
        );
      requestTransaction.meta = {
        ...requestTransaction.meta,
        ...initiate.data,
      };
    }
    request.status = data.status as WithdrawalRequestsEnum;
    requestTransaction.status =
      data.status === WithdrawalRequestsEnum.approved
        ? TransactionStatusEnum.Success
        : TransactionStatusEnum.Failed;

    await Promise.all([request.save(), requestTransaction.save()]);

    return {
      message: `Withdrawal ${data.status.toLowerCase()} successfully`,
    };
  }
}
