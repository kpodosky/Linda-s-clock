import { ConflictException, Injectable, PipeTransform } from '@nestjs/common';
import {
  CreatePaymentLinkDto,
  UpdatePaymentLinkDto,
  businessCustomerCreateTransactionDto,
} from '../dto/payment.link.dto';
import { PaymentLinkService } from '../service/payment.link.service';
import { PaymentLinkStatusEnum } from '../enum/payment.link.enum';
import { WalletService } from 'src/wallet/service/wallet.service';
import { WalletNetworkService } from 'src/wallet/service/wallet.coin.network.service';
import { CoinNetworkService } from 'src/wallet/service/coin.network.service';
import {
  WalletCategoryEnum,
  WalletStatusEnum,
} from 'src/wallet/enum/wallet.enum';
import { CpayBusinessService } from 'src/business/service/cpay.business.service';
import { BussinessAccountStatus } from 'src/business/dto/cpay.user.dto';
import { AppConfigService } from 'src/app-config/service/app-config.service';

@Injectable()
export class PaymentLinkCreatePipe implements PipeTransform {
  constructor(
    private readonly paymentLinkService: PaymentLinkService,
    private readonly walletService: WalletService,
    private readonly walletNetworkService: WalletNetworkService,
    private readonly cpayBusinessService: CpayBusinessService,
  ) {}

  async transform(data: CreatePaymentLinkDto) {
    const { url, coinId, businessId } = data;
    const urlExists = await this.paymentLinkService.findOne({
      where: { url },
    });
    if (urlExists) throw new ConflictException('URL name already exists');

    const coin = await this.walletNetworkService.findOne({
      where: {
        coinId,
        businessId,
      },
    });
    if (!coin) throw new ConflictException('Business coin not found');

    if (coinId) {
      const coin = await this.walletService.findOne({
        where: {
          coinId,
          status: WalletStatusEnum.inactive,
        },
      });
      console.log('coin...,', coin);
      if (coin)
        throw new ConflictException(
          'This coin has been disabled for this business',
        );
    }
    return data;
  }
}

@Injectable()
export class PaymentLinkUpdatePipe implements PipeTransform {
  constructor(
    private readonly paymentLinkService: PaymentLinkService,
    private readonly walletService: WalletService,
  ) {}

  async transform(data: UpdatePaymentLinkDto) {
    const { url, coinId, paymentLinkId } = data;
    await this.paymentLinkService.findById(paymentLinkId);
    if (url) {
      const urlExists = await this.paymentLinkService.findOne({
        where: { url },
      });
      if (urlExists) throw new ConflictException('URL name already exists');
    }
    if (coinId) {
      const coin = await this.walletService.findOne({
        where: {
          coinId,
          status: WalletStatusEnum.inactive,
        },
      });
      if (coin)
        throw new ConflictException(
          'This coin has been disabled for this business',
        );
    }

    return data;
  }
}

@Injectable()
export class PaymentLinkTransactionPipe implements PipeTransform {
  constructor(
    private readonly paymentLinkService: PaymentLinkService,
    private readonly walletNetworkService: WalletNetworkService,
    private readonly coinNetworkService: CoinNetworkService,
    private readonly walletService: WalletService,
    private readonly cpayBusinessService: CpayBusinessService,
    private readonly appConfigService: AppConfigService,
  ) {}

  async transform(data: businessCustomerCreateTransactionDto) {
    const { paymentLinkId, networkId } = data;

    const config = await this.appConfigService.findOne({
      where: {
        source: 'clockpay',
      },
    });
    if (!config.isDepositAvailable) {
      throw new ConflictException(
        'System is not available, please try again later',
      );
    }

    const urlExists = await this.paymentLinkService.findOne({
      where: { id: paymentLinkId },
    });
    if (!urlExists) throw new ConflictException('Invalid payment link');
    const business = await this.cpayBusinessService.findOne({
      where: { id: urlExists.businessId },
    });

    if (business.businessStatus !== BussinessAccountStatus.Active) {
      throw new ConflictException('Invalid payment link');
    }
    if (urlExists.status === PaymentLinkStatusEnum.disabled) {
      throw new ConflictException(
        `Payment link has been disabled, and can't accepts payment at this time`,
      );
    } else if (urlExists.status === PaymentLinkStatusEnum.deleted) {
      throw new ConflictException('Payment link has been deleted');
    }
    const coinNetwork1 = await this.coinNetworkService.findById(networkId);

    const coinNetworkCheck = await this.walletNetworkService.findOne({
      where: {
        networkId: coinNetwork1.id,
        businessId: urlExists.businessId,
      },
    });
    console.log('coinNetworkCheck...', coinNetworkCheck);

    if (!coinNetworkCheck) {
      throw new ConflictException(
        'Business does not support this currency at the moment',
      );
    }
    const wallet = await this.walletService.findOne({
      where: {
        businessId: coinNetworkCheck.businessId,
        category: WalletCategoryEnum.crypto,
        coinId: coinNetworkCheck.coinId,
        status: WalletStatusEnum.inactive,
      },
    });
    if (wallet) {
      throw new ConflictException(
        'This coin has been disabled for this business',
      );
    }

    return data;
  }
}
