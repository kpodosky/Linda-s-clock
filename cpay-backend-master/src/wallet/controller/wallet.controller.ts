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
  UseGuards,
} from '@nestjs/common';
import { ObjectValidationPipe } from '@app/lib/pipe/validation.pipe';
import { WalletService } from '../service/wallet.service';
import { BusinessTokenDecorator } from '@app/lib/token/decorator/token.decorator';
import {
  BusinessSetAcceptedCurrencyValidator,
  BusinessWalletSearchValidator,
  WalletSearchValidator,
  WalletSumSearchValidator,
  addCryptoWalletValidator,
  walletAdressValidator,
  walletWithdrawalValidator,
} from '../validator/wallet.validator';
import {
  AddCryptoWalletDto,
  BusinessWalletSearchValidatorDto,
  SetAcceptedCurrencyDto,
  WalletAddressValidatorDto,
  WalletWithdrawalValidatorDto,
} from '../dto/wallet.dto';
import {
  BusinessTokenDto,
  RequiredAccountOwnerGuard,
  RequiredBankGuard,
  RequiredKYBGuard,
} from '@app/lib/token/dto/token.dto';
import { TransactionService } from 'src/transaction/service/transaction.service';
import { CpayBusinessService } from 'src/business/service/cpay.business.service';
import { FlutterwaveService } from 'src/fluterwave/service/flutterwave.service';
import { BankAccountService } from 'src/bank/service/bank.service';
import {
  TransactionCategoryEnum,
  TransactionTypeEnum,
} from 'src/transaction/enums/transaction.enum';
import {
  FiatWalletCurrencyEnum,
  WalletCategoryEnum,
  WalletCurrencyEnum,
  WalletStatusEnum,
} from '../enum/wallet.enum';
import { AppConfigService } from 'src/app-config/service/app-config.service';
import { WithdrawalRequestService } from '../service/withdrawal.request.service';
import { RateService } from 'src/rate/service/rate.service';
import { CurrencyEnum } from '@app/lib/enum/country.enum';
import { Op } from 'sequelize';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly cpayBusinessService: CpayBusinessService,
    private readonly transactionService: TransactionService,
    private readonly bankAccountService: BankAccountService,
    private readonly appConfigService: AppConfigService,
    private readonly withdrawalRequestService: WithdrawalRequestService,
    private readonly rateService: RateService,
  ) {}

  @Post('withdraw')
  @RequiredKYBGuard()
  @RequiredBankGuard()
  @RequiredAccountOwnerGuard()
  async withdraw(
    @Body(new ObjectValidationPipe(walletWithdrawalValidator))
    data: WalletWithdrawalValidatorDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    const business = await this.cpayBusinessService.findOne({
      where: {
        id: data.businessId,
      },
    });
    const wallet = await this.walletService.findOne({
      where: {
        id: data.walletId,
      },
    });
    const bank = await this.bankAccountService.findOne({
      where: {
        id: data.bankId,
      },
    });
    const config = await this.appConfigService.findOne({
      where: {
        source: 'clockpay',
      },
    });
    let conversionRate;
    if (data.currency.toLowerCase() === CurrencyEnum.usd.toLowerCase()) {
      conversionRate = 1;
    } else {
      const payableAmount = await this.rateService.findOne({
        where: {
          to: {
            [Op.iLike]: CurrencyEnum.usd.toLowerCase(),
          },
          from: {
            [Op.iLike]: wallet.currency.toLowerCase(),
          },
        },
      });
      if (!payableAmount) {
        throw new BadRequestException('Operation failed');
      }
      conversionRate = payableAmount.price;
    }
    const payableAmountRate = await this.rateService.findOne({
      where: {
        to: CurrencyEnum.usd.toLowerCase(),
        from: data.currency.toLowerCase(),
      },
    });
    const reference = this.transactionService.generateReference();
    const charges = Math.ceil(config.withdrawalCharges);
    const transaction = this.transactionService.initialize({
      businessId: data.businessId,
      type: TransactionTypeEnum.Debit,
      currency: wallet.currency as WalletCurrencyEnum,
      amount: data.amount,
      description: `Wallet withdrawal transaction to ${bank.accountName} ${bank.bankName}-`,
      currentBalance: 0,
      reference,
      category: wallet.category as TransactionCategoryEnum,
      previousBalance: wallet.availableBalance ?? 0,
      meta: {},
      sender: `${business.name}`,
      walletId: wallet.id,
      charges,
      rateInUsd: conversionRate,
    });
    const withdrawalRequest = await this.withdrawalRequestService.initialize({
      amount: data.amount,
      charges,
      name: bank.accountName,
      bankCode: bank.bankCode,
      accountNumber: bank.accountNumber,
      currency: bank.currency,
      reference: reference,
      businessId: business.id,
      description: transaction.description,
      category: wallet.category as TransactionCategoryEnum,
    });
    await Promise.all([transaction.save(), withdrawalRequest.save()]);
    await this.walletService.increment(
      {
        where: {
          id: data.walletId,
        },
      },
      {
        availableBalance: -(
          conversionRate *
          (data.amount / payableAmountRate.price)
        ),
        ledgerBalance: -(
          conversionRate *
          (data.amount / payableAmountRate.price)
        ),
      },
    );
    const wallet2 = await this.walletService.findOne({
      where: {
        id: data.walletId,
      },
    });
    transaction.currentBalance = wallet2.availableBalance;
    await transaction.save();
  }

  @Get('business')
  @UseGuards()
  async Search(
    @Query(new ObjectValidationPipe(BusinessWalletSearchValidator))
    query: BusinessWalletSearchValidatorDto,
    @BusinessTokenDecorator()
    token: BusinessTokenDto,
  ) {
    const business = await this.cpayBusinessService.findById(query.businessId);
    if (!business.accountId) {
      business.accountId = await this.walletService.generateId();
      await business.save();
    }
    return await this.walletService.search(query);
  }

  @Get('crypto-assets')
  @UseGuards()
  async getSupportedAssets(
    @Query(new ObjectValidationPipe(WalletSearchValidator))
    query: BusinessWalletSearchValidatorDto,
    @BusinessTokenDecorator()
    token: BusinessTokenDto,
  ) {
    try {
      // const business = await this.businessService.findById(token.businessId);
      // const assets = await this.fireBlocksService.makeGetRequestToFireBlocks(
      //   '/supported_assets',
      //   business.mode as BusinessAccountModeEnum,
      // );
      // return {
      //   data: assets,
      // };
    } catch (error) {
      Logger.log('Crpto assets retrieval error', error);
      throw new InternalServerErrorException(
        'Something went wrong, please try again',
      );
    }
  }

  @Get('all-wallets')
  @UseGuards()
  async getAllWallets(
    @Query(new ObjectValidationPipe(WalletSearchValidator))
    query: BusinessWalletSearchValidatorDto,
    @BusinessTokenDecorator()
    token: BusinessTokenDto,
  ) {
    try {
      // const business = await this.businessService.findById(token.businessId);
      // const assets = await this.fireBlocksService.makeGetRequestToFireBlocks(
      //   '/vault/asset_wallets',
      //   business.mode as BusinessAccountModeEnum,
      // );
      // return {
      //   data: assets,
      // };
    } catch (error) {
      Logger.log('Crpto assets retrieval error', error);
      throw new InternalServerErrorException(
        'Something went wrong, please try again',
      );
    }
  }

  @Get('sum')
  @UseGuards()
  async walletsSum(
    @Query(new ObjectValidationPipe(WalletSumSearchValidator))
    query: BusinessWalletSearchValidatorDto,
    @BusinessTokenDecorator()
    token: BusinessTokenDto,
  ) {
    const wallets = await this.walletService.findAll({
      where: {
        businessId: query.businessId,
      },
    });
    let total = 0;
    if (query.currency === FiatWalletCurrencyEnum.USD) {
      for (let i = 0; i < wallets.length; i++) {
        const rate = await this.rateService.findOne({
          where: {
            to: FiatWalletCurrencyEnum.USD.toLowerCase(),
            from: wallets[i].currency.toLowerCase(),
          },
        });
        total += rate.price * (wallets[i].availableBalance ?? 0);
      }
    } else if (query.currency === FiatWalletCurrencyEnum.NGN) {
      for (let i = 0; i < wallets.length; i++) {
        const rate = await this.rateService.findOne({
          where: {
            to: FiatWalletCurrencyEnum.USD.toLowerCase(),
            from: wallets[i].currency.toLowerCase(),
          },
        });
        total += (wallets[i].availableBalance ?? 0) / rate.price;
      }
      const ngnRate = await this.rateService.findOne({
        where: {
          to: FiatWalletCurrencyEnum.USD.toLowerCase(),
          from: FiatWalletCurrencyEnum.NGN.toLowerCase(),
        },
      });
      total = total * ngnRate.price;
    }

    return {
      data: {
        balance: this.transactionService.roundUpToTwoDecimals(total),
      },
    };
  }

  @Patch('accepted-currency/:walletId')
  @UseGuards()
  async setAcceptedCurrency(
    @Param(new ObjectValidationPipe(BusinessSetAcceptedCurrencyValidator))
    data: SetAcceptedCurrencyDto,
    @BusinessTokenDecorator()
    token: BusinessTokenDto,
  ) {
    const wallet = await this.walletService.findOne({
      where: {
        id: data.walletId,
        category: WalletCategoryEnum.crypto,
      },
    });
    if (!wallet) {
      throw new BadRequestException('Invalid selected crypto wallet');
    }
    wallet.status =
      wallet.status === WalletStatusEnum.active
        ? WalletStatusEnum.inactive
        : WalletStatusEnum.active;
    await wallet.save();
    return {
      message: `Wallet is now ${
        wallet.status === WalletStatusEnum.active
          ? WalletStatusEnum.inactive
          : WalletStatusEnum.active
      }`,
    };
  }

  @Get('accepted-currencies')
  async getAcceptedWallets(
    @Query(new ObjectValidationPipe(BusinessWalletSearchValidator))
    query: BusinessWalletSearchValidatorDto,
    @BusinessTokenDecorator()
    token: BusinessTokenDto,
  ) {
    query.category = WalletCategoryEnum.crypto;
    const wallets = await this.walletService.cryptoWallet(query);
    const resolved = wallets.data.map((wallet) => ({
      id: wallet.id,
      currency: wallet.currency,
      name: wallet.name,
      icon: wallet.icon,
      status: wallet.status,
    }));
    return { data: resolved };
  }

  @Post('add-crypto-wallet')
  // @UseGuards(BusinessOwnerActivityGuard, BusinessOwnerCryptoWalletGuard)
  async addWallet(
    @Body(new ObjectValidationPipe(addCryptoWalletValidator))
    data: AddCryptoWalletDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    try {
      // const business = await this.businessService.findById(token.businessId);
      // const vaultId = await this.businessService.ModeCheckForVault(
      //   business.mode as BusinessAccountModeEnum,
      //   business,
      // );
      // const asset = await this.fireBlocksService.makePostRequestToFireBlocks(
      //   `/vault/accounts/${vaultId}/${data.assetId}`,
      //   {},
      //   business.mode as BusinessAccountModeEnum,
      // );
      // const wallet = this.walletService.initialize({
      //   businessId: token.businessId,
      //   asset: data.name,
      //   address: asset.address,
      //   legacyAddress: asset.legacyAddress,
      //   category: WalletCategoryEnum.crypto,
      // });
      // await wallet.save();
      // Logger.debug(`${token.id} updated business information address`);
      // // TODO: send account verification email
      // return {
      //   message: `Wallet added successfully`,
      //   asset,
      //   wallet,
      // };
    } catch (error) {
      console.log(`Error while adding crypto wallet`, error);
      Logger.debug(`Error while adding crypto wallet`, error);
      if (error.response.data) {
        throw new BadRequestException(`${error.response.data.message}`);
      } else {
        throw new InternalServerErrorException('Something unexpected happened');
      }
    }
  }

  @Post('validate-destination-address')
  async validateDesticationAddress(
    @Body(new ObjectValidationPipe(walletAdressValidator))
    data: WalletAddressValidatorDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    try {
      // const business = await this.businessService.findById(token.businessId);
      // await this.walletService.findOneOrErrorOut({
      //   where: { assetId: data.assetId, businessId: token.businessId },
      // });
      // const response = await this.fireBlocksService.makeGetRequestToFireBlocks(
      //   `/transactions/validate_address/${data.assetId}/${data.address}`,
      //   business.mode as BusinessAccountModeEnum,
      // );
      // Logger.debug(`${token.id} updated business information address`);
      // // TODO: send account verification email
      // return {
      //   message: `Wallet added successfully`,
      //   data: response,
      // };
    } catch (error) {
      console.log(`Error while adding crypto wallet`, error);
      Logger.debug(`Error while adding crypto wallet`, error);
      if (error.response.data) {
        throw new BadRequestException(`${error.response.data.message}`);
      } else {
        throw new InternalServerErrorException('Something unexpected happened');
      }
    }
  }
}
