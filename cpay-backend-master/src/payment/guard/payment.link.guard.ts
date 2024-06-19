import {
  CanActivate,
  ConflictException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { PaymentLinkService } from 'src/payment/service/payment.link.service';

@Injectable()
export class PaymentLinkCreateGard implements CanActivate {
  constructor(private readonly paymentLinkService: PaymentLinkService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { url } = request.body;
    console.log('request.body.', request.body);

    const urlExists = await this.paymentLinkService.findOne({
      where: { url },
    });
    if (urlExists) throw new ConflictException('URL name already exists');

    return true;
  }
}
