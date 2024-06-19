import { EmailRequestDataDto } from 'src/email/dto/email.dto';
import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from 'src/email/service/email.service';
import { EmailTemplatesEnum } from 'src/email/enum/email.enum';
import { OnEvent } from '@nestjs/event-emitter';
import { WaitListEventsEnum } from '../event/waitlist.event';

@Injectable()
export class WaitlistHandler {
  constructor(private readonly emailService: EmailService) {}

  @OnEvent(WaitListEventsEnum.SIGN_UP_WAITLIST_NOTIFICATION)
  async SendSignUpWaitlistEmail(data: EmailRequestDataDto) {
    const emailData = {
      to: data.email,
      template: EmailTemplatesEnum.waitlist,
      subject:
        'Unlock Your Business Potential: Priority Access to Our B2B Crypto Payment Solution',
      link: data.link,
      sender: data.username,
      username: data.username,
      message: data.message,
      title: data.title,
    };
    await this.emailService.sendHostedMail(emailData);
  }

  @OnEvent(WaitListEventsEnum.CONTACT_SALES)
  async contactSales(data: EmailRequestDataDto) {
    const emailData = {
      to: data.email,
      template: EmailTemplatesEnum.contact_sales,
      subject: 'New Sales Lead/Request',
      link: data.link,
      sender: data.username,
      username: data.username,
      message: data.message,
      title: data.title,
      fullName: data.username,
    };
    await this.emailService.sendHostedMail(emailData);
  }
}
