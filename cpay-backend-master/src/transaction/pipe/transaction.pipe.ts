import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  PipeTransform,
} from '@nestjs/common';
import { CryptoTransactionConfirmationDto } from '../dtos/transaction.dto';
import { TransactionService } from '../service/transaction.service';
import { PaymentLinkTransactionService } from 'src/payment/service/payment.link.transaction.service';
import { CoinNetworkService } from 'src/wallet/service/coin.network.service';
import {
  TransactionStatusEnum,
  WithdrawalRequestsEnum,
} from '../enums/transaction.enum';
import { WithdrawalRequestService } from 'src/wallet/service/withdrawal.request.service';

@Injectable()
export class CryptoTransactionUpdatePipe implements PipeTransform {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly paymentLinkTransactionService: PaymentLinkTransactionService,
    private readonly coinNetworkService: CoinNetworkService,
  ) {}

  async transform(data: CryptoTransactionConfirmationDto) {
    const { trxHash, reference } = data;

    const transaction = await this.transactionService.findOne({
      where: { reference, status: TransactionStatusEnum.Pending },
    });
    if (!transaction) {
      throw new BadRequestException('Invalid transaction reference');
    }
    const paymentLinkTrx = await this.paymentLinkTransactionService.findOne({
      where: { reference, status: TransactionStatusEnum.Pending },
    });
    if (!paymentLinkTrx) {
      throw new BadRequestException('Invalid transaction reference');
    }
    if (paymentLinkTrx.meta.trxHash === trxHash) {
      throw new BadRequestException('Duplicate transaction');
    }
    const network = await this.coinNetworkService.findById(
      paymentLinkTrx.meta.networkId,
    );
    if (!network) {
      throw new BadRequestException('Invalid network');
    }
    return data;
  }
}

@Injectable()
export class WithdrawFromWalletUpdatePipe implements PipeTransform {
  constructor(
    private readonly withdrawalRequestService: WithdrawalRequestService,
    private readonly transactionService: TransactionService,
  ) {}

  async transform(customer: any) {
    const withdrawalRequest = await this.withdrawalRequestService.findOne({
      where: { id: customer.requestId, status: WithdrawalRequestsEnum.pending },
    });

    const pendingTransaction = await this.transactionService.findOne({
      where: {
        id: withdrawalRequest.reference,
        status: TransactionStatusEnum.Pending,
      },
    });
    if (!withdrawalRequest || !pendingTransaction) {
      Logger.error(
        'Pending withdrawal request not found for webhook confirmation',
      );
      throw new ConflictException('Pending withdrawal request not found');
    }

    return customer;
  }
}
