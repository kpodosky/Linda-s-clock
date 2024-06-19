import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from 'src/email/service/email.service';
import { OnEvent } from '@nestjs/event-emitter';
import { OtpService } from 'src/otp/services/otp.service';
import { TransactionEventEnums } from '../event/transaction.event';
import {
  EmailRequestDataDto,
  EmailTemplateDataDto,
} from 'src/email/dto/email.dto';
import { EmailTemplatesEnum } from 'src/email/enum/email.enum';
import { OtpTypeEnum } from 'src/otp/enums/otp.enum';

@Injectable()
export class TransactionHandler {
  constructor(
    private readonly emailService: EmailService,
    private readonly otpService: OtpService,
  ) {}

  @OnEvent(TransactionEventEnums.SEND_TRANSACTION_CONFIRMATION_CODE)
  async sendPasswordResetCode(data: EmailTemplateDataDto) {
    data.template = EmailTemplatesEnum.otp;
    data.type = OtpTypeEnum.transactionConfirmation;
    await this.sendEmailWithOtp(data);
  }
  async sendEmailWithOtp(data: EmailRequestDataDto) {
    try {
      const generatedCode = await this.otpService.generateCode(
        data.receiver,
        data.type,
      );

      await this.emailService.sendHostedMail({
        to: data.email,
        template: data.template,
        subject: data.subject ?? data.title,
        title: data.title,
        username: data.username,
        firstName: data.username,
        code: generatedCode.code,
        body: data.message,
      });
    } catch (error) {
      console.log(error);
      Logger.error({
        type: 'otp-email-notification-error',
        error,
      });
    }
  }

  @OnEvent(TransactionEventEnums.PAYMENT_LINK_CONFIRMATION_MAIL)
  async NewBusinessCreation(data: EmailRequestDataDto) {
    const emailData = {
      to: data.email,
      template: EmailTemplatesEnum.payment_link_transaction,
      subject: `New Payment Link Payment From ${data.customerEmail}`,
      link: data.link,
      businessName: data.businessName,
      amount: data.amount.toFixed(2),
      availableBalance: data.availableBalance.toFixed(2),
      coin: data.coin,
      customerEmail: data.customerEmail,
      fullName: data.fullName,
      preview: data.preview,
      transactionDate: data.transactionDate,
      transactionId: data.reference,
    };
    await this.emailService.sendHostedMail(emailData);
  }

  @OnEvent(TransactionEventEnums.WITHDRAWAL_CONFIRMATION_MAIL)
  async WithdrawalTransactionEmail(data: EmailRequestDataDto) {
    const emailData = {
      to: data.email,
      template: EmailTemplatesEnum.payment_link_transaction,
      subject: `Withdrawal Alert From Business ${data.currency} Wallet`,
      businessName: data.businessName,
      amount: data.amount.toFixed(2),
      availableBalance: data.availableBalance.toFixed(2),
      currency: data.coin,
      fullName: data.fullName,
      preview: data.preview,
      transactionDate: data.transactionDate,
      transactionId: data.reference,
    };
    await this.emailService.sendHostedMail(emailData);
  }
}
