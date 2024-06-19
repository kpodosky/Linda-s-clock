import { BusinessTokenDto } from '@app/lib/token/dto/token.dto';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { WalletService } from '../service/wallet.service';

@Injectable()
export class BusinessOwnerCryptoWalletGuard implements CanActivate {
  constructor(
    private readonly businessMemberService: any,
    // private readonly businessMemberService: BusinessMemberService,
    private readonly walletService: WalletService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const response: Response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();
    const token: BusinessTokenDto = response.locals.tokenData;

    const { assetId } = request.body;
    const wallet = await this.walletService.findOne({
      where: { businessId: token.businessId, assetId },
    });

    if (wallet) throw new UnauthorizedException('Wallet already exists');

    return true;
  }
}
