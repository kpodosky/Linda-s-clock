import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as formData from 'form-data';
import Mailgun from 'mailgun.js';
import * as newMailgun from 'mailgun-js';
import * as fs from 'fs';
import handlebars from 'handlebars';
import { join } from 'path';

@Injectable()
export class EmailService {
  private readonly mailgun = new Mailgun(formData);
  private readonly client = this.mailgun.client({
    username: 'api',
    key: this.configService.get('MAIL_GUN_SECRET_KEY'),
  });

  constructor(private configService: ConfigService) {}

  async send(bodyData: any): Promise<any> {
    try {
      console.log('....', bodyData);
      const templatePath = join(
        __dirname,
        '..',
        'emails',
        `${bodyData.template}.hbs`,
      );
      const hbsTemplate = fs.readFileSync(templatePath, 'utf-8');

      const templateData = {
        subject: bodyData.subject,
        title: bodyData.title,
        message: bodyData.message,
        link: bodyData.link,
        ...bodyData,
      };

      // Compile the HBS template with templateData
      const compiledHtml = handlebars.compile(hbsTemplate)(templateData);

      const data = {
        from: bodyData.from ? bodyData.from : 'cpay@mail.com',
        to: [bodyData.to],
        cc: bodyData.cc,
        bcc: '',
        subject: bodyData.subject,
        text: bodyData?.body?.message,
        html: compiledHtml,
        ...bodyData,
      };
      await this.client.messages.create('cpay.com', data);
      Logger.log(`email sent to ${bodyData.to}`);
    } catch (error) {
      console.log(error);
      Logger.log(error);
    }
  }

  async sendHostedMail(emaildata: any): Promise<any> {
    try {
      const DOMAIN = 'theclockchain.io';
      // const DOMAIN = 'sandbox51f4cd8def084cb8b2601a020cb73884.mailgun.org';
      const mg = newMailgun({
        apiKey: this.configService.get('MAIL_GUN_SECRET_KEY'),
        domain: DOMAIN,
      });
      const data = {
        from: 'Cpay <hello@theclockchain.io>',
        to: emaildata.to,
        subject: emaildata.subject,
        template: emaildata.template,
        'h:X-Mailgun-Variables': JSON.stringify({
          username: emaildata.username,
          link: emaildata?.link,
          code: emaildata?.code,
          phoneNumber: emaildata?.phoneNumber,
          sender: emaildata?.sender,
          message: emaildata?.message,
          email: emaildata?.email,
          ...emaildata,
          otp1: emaildata.code && emaildata.code.split('')[0],
          otp2: emaildata.code && emaildata.code.split('')[1],
          otp3: emaildata.code && emaildata.code.split('')[2],
          otp4: emaildata.code && emaildata.code.split('')[3],
          otp5: emaildata.code && emaildata.code.split('')[4],
          otp6: emaildata.code && emaildata.code.split('')[5],
        }),
      };
      mg.messages().send(data, function (error, body) {
        console.log('body...', body);
        console.log('Email error...', error);
      });
    } catch (error) {
      Logger.error('Email error:', error);
      console.log('Email error:', error);
    }
  }
}
