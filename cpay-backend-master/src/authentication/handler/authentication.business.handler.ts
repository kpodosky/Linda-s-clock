import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from 'src/email/service/email.service';
import { OtpTypeEnum } from 'src/otp/enums/otp.enum';
import { OtpService } from 'src/otp/services/otp.service';
import { AuthenticationEventEnums } from '../event/authentication.business.event';
import { EmailTemplatesEnum } from 'src/email/enum/email.enum';
import {
  EmailRequestDataDto,
  EmailTemplateDataDto,
} from 'src/email/dto/email.dto';
import { CreateLoginActivityDto, SaveLoggedInDeviceDto } from '../dto/authentication.dto';
import { CpayLoginDeviceService } from 'src/business/service/cpay.login.device.service';
import { LoginActivityService } from 'src/business/service/login.activity.service';

@Injectable()
export class AuthenticationHandler {
  constructor(
    private readonly emailService: EmailService,
    private readonly otpService: OtpService,
    private readonly cpayLoginDeviceService: CpayLoginDeviceService,
    private readonly loginActivityService: LoginActivityService,
  ) {}

  @OnEvent(AuthenticationEventEnums.LOGIN_ACTIVITY_LOG)
  async loginActivityLog(data: CreateLoginActivityDto) {
    try {
      const loginActivity = this.loginActivityService.initialize(data);
      await loginActivity.save();
    } catch (error) {
      Logger.error({
        type: 'login-activity-log',
        error,
      });
    }
  }

  @OnEvent(AuthenticationEventEnums.SEND_WELCOME_EMAIL)
  async SendWelcomeEmail(data: EmailRequestDataDto) {
    const emailData = {
      to: data.email,
      template: EmailTemplatesEnum.welcome,
      subject: 'Welcome To CPay',
      link: data.link,
      sender: data.username,
      message: data.message,
      title: data.title,
    };
    await this.emailService.sendHostedMail(emailData);
  }

  @OnEvent(AuthenticationEventEnums.LOGIN_ALERT)
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

  @OnEvent(AuthenticationEventEnums.EMAIL_VERIFICATION_EMAIL_OTP)
  async send2FaVerificationCode(data: EmailTemplateDataDto) {
    data.template = EmailTemplatesEnum.otp;
    data.type = OtpTypeEnum.emailConfirmation;
    await this.sendEmailWithOtp(data);
  }

  @OnEvent(AuthenticationEventEnums.SEND_PASSWORD_RESET_EMAIL)
  async sendPasswordResetCode(data: EmailTemplateDataDto) {
    data.template = EmailTemplatesEnum.otp;
    data.type = OtpTypeEnum.PasswordReset;
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
        preview: data.preview,
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

  @OnEvent(AuthenticationEventEnums.SAVE_LOGGED_IN_DEVICE)
  async SaveLoggedInDevice(data: SaveLoggedInDeviceDto) {
    let deviceExists = await this.cpayLoginDeviceService.findOne({
      where: {
        userId: data.userId,
        os: data.os,
        versionId: data.versionId,
      },
    });
    if (!deviceExists) {
      deviceExists = this.cpayLoginDeviceService.initialize(data);
    }
    await deviceExists.save();
  }
}
