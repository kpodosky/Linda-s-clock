import {
  BadRequestException,
  CanActivate,
  ConflictException,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import {
  REQUIRED_ACCOUNT_OWNER,
  REQUIRED_BANK_ID,
  REQUIRED_KYB,
  REQUIRED_KYC,
  REQUIRE_2FA_KEY,
  SKIP_AUTH_GUARD_KEY,
  SKIP_TWO_FACTOR_AUTH,
} from '../dto/token.dto';
import { TokenService } from '../service/token.service';
import { CpayUserService } from 'src/business/service/cpay.user.service';
import { AdminService } from 'src/admin/service/admin.service';
import { CpayBusinessService } from 'src/business/service/cpay.business.service';
import {
  BussinessAccountStatus,
  CustomerAccountStatus,
} from 'src/business/dto/cpay.user.dto';
import { CustomRequest } from '@app/lib/interceptors/ip.interceptor';
import { BankAccountService } from 'src/bank/service/bank.service';
import { WalletService } from 'src/wallet/service/wallet.service';
import { BusinessDocumentVerificationStatusEnum } from 'src/business/enum/business.enum';
import { Op } from 'sequelize';
import { AppConfigService } from 'src/app-config/service/app-config.service';
import { RateService } from 'src/rate/service/rate.service';
import { CurrencyEnum } from '@app/lib/enum/country.enum';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly tokenService: TokenService,
    private readonly cpayUserService: CpayUserService,
    private readonly cpayBusinessService: CpayBusinessService,
    private readonly adminService: AdminService,
    private readonly bankAccountService: BankAccountService,
    private readonly walletService: WalletService,
    private readonly appConfigService: AppConfigService,
    private readonly rateService: RateService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<CustomRequest>();

    const shouldSkipAuth = !!(
      this.reflector.get(SKIP_AUTH_GUARD_KEY, context.getHandler()) ??
      this.reflector.get(SKIP_AUTH_GUARD_KEY, context.getClass())
    );

    if (shouldSkipAuth) {
      return true;
    }

    if (!request.headers.authorization) {
      throw new UnauthorizedException('Please provide a valid login token');
    }

    const authorizationHeader = request.headers.authorization;
    const [bearer, token] = authorizationHeader.split(' ');

    if (token === 'null' || token === null) {
      throw new UnauthorizedException('Session expired');
    }

    if (bearer !== 'Bearer') {
      throw new UnauthorizedException('Please provide a valid login token');
    }

    if (!token) {
      throw new UnauthorizedException('Please provide a valid login token');
    }

    const lastToken = await this.cpayUserService.findOne({
      where: {
        lastToken: token,
        deletedAt: {
          [Op.is]: null || undefined,
        },
      },
    });

    const adminLastToken = await this.adminService.findOne({
      where: {
        lastToken: token,
        deletedAt: {
          [Op.is]: null || undefined,
        },
      },
    });

    if (!lastToken && !adminLastToken) {
      throw new UnauthorizedException('Please provide a valid login token');
    }

    const response: Response = context.switchToHttp().getResponse();
    const tokenData = await this.tokenService.verifyBusinessToken(token);
    response.locals.tokenData = tokenData;

    if (!tokenData) {
      throw new UnauthorizedException('Authorization token not passed');
    }
    const shouldSkipTwoFactorAuth = !!(
      this.reflector.get(SKIP_TWO_FACTOR_AUTH, context.getHandler()) ??
      this.reflector.get(SKIP_TWO_FACTOR_AUTH, context.getClass())
    );
    if (shouldSkipTwoFactorAuth) {
      return true;
    }
    if (
      lastToken &&
      lastToken.authentication.googleAuthentication &&
      !lastToken.authVerified
    ) {
      throw new UnauthorizedException('Complete your 2 step authentication');
    }

    const checkKYBStatus = !!(
      this.reflector.get(REQUIRED_KYB, context.getHandler()) ??
      this.reflector.get(REQUIRED_KYB, context.getClass())
    );
    const { businessId, bankId, amount, walletId, currency } = request.body;
    if (businessId && checkKYBStatus) {
      const business = await this.cpayBusinessService.findById(businessId);
      if (business.businessStatus !== BussinessAccountStatus.Active) {
        throw new UnauthorizedException(
          'Business needs to be active to complete this request',
        );
      }
    }

    const checkAccountOwner = !!(
      this.reflector.get(REQUIRED_ACCOUNT_OWNER, context.getHandler()) ??
      this.reflector.get(REQUIRED_ACCOUNT_OWNER, context.getClass())
    );
    if (businessId && checkAccountOwner) {
      const business = await this.cpayBusinessService.findById(businessId);
      if (business.ownerId !== lastToken.id) {
        throw new UnauthorizedException('Unauthorized request');
      }
    }

    const checkKYCStatus = !!(
      this.reflector.get(REQUIRED_KYC, context.getHandler()) ??
      this.reflector.get(REQUIRED_KYC, context.getClass())
    );
    if (businessId && checkKYCStatus) {
      if (
        lastToken.verification.kycVerification !==
        CustomerAccountStatus.Approved
      ) {
        throw new UnauthorizedException(
          'Please verify your personal details to continue',
        );
      }
    }

    const requireBankId = <boolean>(
      this.reflector.get(REQUIRED_BANK_ID, context.getHandler())
    );
    if (requireBankId) {
      const config = await this.appConfigService.findOne({
        where: {
          source: 'clockpay',
        },
      });
      if (!config.isWithdrawalAvailable) {
        throw new ConflictException(
          'System is not available, please try again later',
        );
      }
      const bank = await this.bankAccountService.findOne({
        where: {
          id: bankId,
          businessId,
        },
      });
      if (!bank) {
        throw new UnauthorizedException('Invalid selected bank');
      }
      const wallet = await this.walletService.findOne({
        where: {
          id: walletId,
          businessId,
        },
      });
      if (!wallet) {
        throw new UnauthorizedException('Invalid selected wallet');
      }
      let conversionRate;
      if (currency.toLowerCase() === CurrencyEnum.usd.toLowerCase()) {
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
          from: currency.toLowerCase(),
        },
      });
      const charges = Math.ceil(config.withdrawalCharges);
      if (
        payableAmountRate.price * (conversionRate * wallet.availableBalance) <
        amount + charges
      ) {
        throw new UnauthorizedException('Insufficient wallet balance');
      }
    }

    return true;
  }
}
