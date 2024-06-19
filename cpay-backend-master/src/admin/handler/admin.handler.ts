import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from 'src/email/service/email.service';
import { OnEvent } from '@nestjs/event-emitter';
import { OtpService } from 'src/otp/services/otp.service';
import { AdminEventEnums } from '../event/admin.event';
import { EmailRequestDataDto } from 'src/email/dto/email.dto';
import { EmailTemplatesEnum } from 'src/email/enum/email.enum';
import { OtpTypeEnum } from 'src/otp/enums/otp.enum';
import { AdminActivityService } from '../service/admin.activities.service';
import { CreateAdminActivityDto } from '../dto/admin.activity.dto';

@Injectable()
export class AdminHandler {
  constructor(
    private readonly emailService: EmailService,
    private readonly otpService: OtpService,
    private readonly adminActivityService: AdminActivityService,
  ) {}

  @OnEvent(AdminEventEnums.LOG_ADMIN_ACTIVITY)
  async adminLog(data: CreateAdminActivityDto) {
    Logger.debug('...**************', data);
    const activity = await this.adminActivityService.initialize(data);
    await activity.save();
  }

  @OnEvent(AdminEventEnums.LOGIN_ALERT)
  async LoginAlert(data: EmailRequestDataDto) {
    const emailData = {
      to: data.email,
      template: EmailTemplatesEnum.login_alert,
      subject: 'ClockPay Login Notification',
      link: data.link,
      username: data.username,
      message: data.message,
      title: data.title,
      preview: 'Login Notification',
    };
    await this.emailService.sendHostedMail(emailData);
  }

  @OnEvent(AdminEventEnums.SEND_REQUEST_ACCESS_MAIL)
  async adminAccessAlert(data: EmailRequestDataDto) {
    const emailData = {
      to: data.email,
      template: EmailTemplatesEnum.admin_invite,
      subject: data.subject ?? data.title,
      link: data.link,
      username: data.username,
      preview: 'Clockpay Admin Invitation',
      email: data.email,
      role: data.role,
    };
    await this.emailService.sendHostedMail(emailData);
  }

  @OnEvent(AdminEventEnums.SEND_2FA_VERIFICATION_CODE)
  async SendEmailOtp(data: EmailRequestDataDto) {
    const codeValue = await this.otpService.generateCode(
      data.receiver,
      OtpTypeEnum.emailConfirmation,
    );
    const emailData = {
      to: data.email,
      template: EmailTemplatesEnum.otp,
      subject: 'Forgot Password',
      link: data.link,
      username: data.username,
      message: data.message,
      title: data.title,
      code: codeValue.code,
    };
    await this.emailService.sendHostedMail(emailData);
  }
}
