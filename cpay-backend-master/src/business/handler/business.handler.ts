import { EmailRequestDataDto as EmailRequestDataDto } from 'src/email/dto/email.dto';
import { BusinessEventsEnum } from '../event/business.event';
import { Injectable, Logger } from '@nestjs/common';
import { OtpService } from 'src/otp/services/otp.service';
import { EmailService } from 'src/email/service/email.service';
import { EmailTemplatesEnum } from 'src/email/enum/email.enum';
import { OnEvent } from '@nestjs/event-emitter';
import { OtpTypeEnum } from 'src/otp/enums/otp.enum';
import { CreateActivityDto } from 'src/activities/dto/activities.dto';
import { ActivityService } from 'src/activities/service/activities.service';
import { IdentityVerificationService } from 'src/identity-verification/service/identity.service';
import {
  CustomerAccountStatus,
  CustomerKycVerificationDto,
  KYBVerificationDto,
} from '../dto/cpay.user.dto';
import { CpayUserService } from '../service/cpay.user.service';
import { BusinessDocumentVerificationStatusEnum } from '../enum/business.enum';
import { FileService } from 'src/file/service/file.service';
import { filelocationEnum } from 'src/file/enum/file.enum';
import { CpayBusinessService } from '../service/cpay.business.service';

@Injectable()
export class BusinessHandler {
  constructor(
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
    private readonly identityVerificationService: IdentityVerificationService,
    private readonly activityService: ActivityService,
    private readonly cpayUserService: CpayUserService,
    private readonly fileService: FileService,
    private readonly cpayBusinessService: CpayBusinessService,
  ) {}

  @OnEvent(BusinessEventsEnum.BUSINESS_MEMBER_ACTIVITY)
  async adminLog(data: CreateActivityDto) {
    const activity = await this.activityService.initialize(data);
    await activity.save();
  }

  @OnEvent(BusinessEventsEnum.KYC_VERIFICATION)
  async kycVerification(details: CustomerKycVerificationDto) {
    try {
      const { secure_url } = await this.fileService.uploadDocument(
        `${details.image[0].filename}`,
        filelocationEnum.profileDocument,
      );
      const user = await this.cpayUserService.findById(details.customerId);
      const base64Image = await this.fileService.convertImageToBase64(
        secure_url,
      );
      const { response_code, data, message } =
        await this.identityVerificationService.makeIdentityPassRequest(
          '/verification/document',
          {
            doc_image: base64Image.split('base64,')[1],
            doc_country: details.countryCode,
            doc_type: details.type,
          },
        );
      if (response_code === '00') {
        const nameMatch = await this.cpayUserService.isMatchingName({
          providerReturnedFirstName: data.first_name,
          providerReturnedLastName: data.last_name,
          registeredFirstName: user.firstName,
          registeredLastName: user.lastName,
        });
        const idNumberCheck = details.number === data.documentNumber;

        if (nameMatch && idNumberCheck) {
          user.verification = {
            ...user.verification,
            kycVerification: CustomerAccountStatus.Approved,
          };
          user.identity = {
            ...user.identity,
            url: secure_url,
            idNumber: data.idNumber,
            type: data.type,
          };
        } else {
          user.verification = {
            ...user.verification,
            kycVerification: CustomerAccountStatus.Disapproved,
          };
        }
      } else {
        Logger.log('IDENTITY VERIFICATION DOWNTIME', message);
      }
      await user.save();
    } catch (error) {
      console.log('.............', error.response.data);
    }
  }

  @OnEvent(BusinessEventsEnum.KYB_VERIFICATION)
  async kybVerification(details: KYBVerificationDto) {
    const business = await this.cpayBusinessService.findById(
      details.businessId,
    );
    const { response_code, data } =
      await this.identityVerificationService.makeIdentityPassRequest(
        '/verification/global/company',
        {
          company_number: details.number,
          country_code: 'ng',
        },
      );
    if (response_code === '00') {
      const name = data.name.toLowerCase();
      const businessName = business.name.toLowerCase();
      if (name === businessName) {
        business.verification = {
          ...business.verification,
          identityVerified: BusinessDocumentVerificationStatusEnum.approved,
        };
      } else {
        business.verification = {
          ...business.verification,
          identityVerified: BusinessDocumentVerificationStatusEnum.disapproved,
        };
      }
    }
    await business.save();
  }

  @OnEvent(BusinessEventsEnum.SUCCESSFUL_REGISTRATION_NOTIFICATION)
  async SendWelcomeEmail(data: EmailRequestDataDto) {
    const emailData = {
      to: data.email,
      template: EmailTemplatesEnum.welcome,
      subject: 'Welcome To CPay',
      link: data.link,
      sender: data.username,
      username: data.username,
      message: data.message,
      title: data.title,
    };
    await this.emailService.sendHostedMail(emailData);
  }

  @OnEvent(BusinessEventsEnum.NEW_BUSINESS_ACCOUNT)
  async NewBusinessCreation(data: EmailRequestDataDto) {
    const emailData = {
      to: data.email,
      template: EmailTemplatesEnum.business_creation,
      subject: 'Successfully Created a New Business',
      link: data.link,
      username: data.username,
      preview: 'Successfully Created a New Business',
      title: data.title,
      businessName: data.businessName,
      businessEmail: data.businessEmail,
      accountOwner: data.accountOwner,
      date: data.date,
    };
    await this.emailService.sendHostedMail(emailData);
  }

  @OnEvent(BusinessEventsEnum.EMAIl_CONFIRMATION_OPT)
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
      sender: data.username,
      message: data.message,
      title: data.title,
      code: codeValue.code,
    };
    await this.emailService.sendHostedMail(emailData);
  }

  @OnEvent(BusinessEventsEnum.PASSWORD_RESET_OTP)
  async SendPAsswordOtp(data: EmailRequestDataDto) {
    const codeValue = await this.otpService.generateCode(
      data.receiver,
      OtpTypeEnum.PasswordReset,
    );
    const emailData = {
      to: data.email,
      template: EmailTemplatesEnum.otp,
      subject: 'Forgot Password',
      link: data.link,
      sender: data.username,
      message: data.message,
      title: data.title,
      code: codeValue.code,
    };
    await this.emailService.sendHostedMail(emailData);
  }

  @OnEvent(BusinessEventsEnum.ACCOUNT_INVITE_MAIL)
  async AccountInviteMail(data: EmailRequestDataDto) {
    const emailData = {
      to: data.email,
      template: EmailTemplatesEnum.general,
      subject: data.subject ?? data.title,
      link: data.link,
      sender: data.username,
      message: data.message,
      title: data.title,
    };
    await this.emailService.sendHostedMail(emailData);
  }
}
