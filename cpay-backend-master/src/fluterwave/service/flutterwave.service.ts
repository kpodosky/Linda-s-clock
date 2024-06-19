import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';
import { chargeCardDto, paymentLinkDto } from '../dto/fluttterwave.dto';
import { flutterwaveEventTypeEnum } from '../enum/flutterwave.enum';
import { bankListQueryDto } from 'src/bank/dto/bank.dto';

@Injectable()
export class FlutterwaveService {
  private readonly flutterwaveBaseUrl: string =
    'https://api.flutterwave.com/v3';

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  private async makeFlutterwavePaymentRequest(
    url: string,
    data: any,
  ): Promise<any> {
    try {
      const headers = {
        Authorization: `Bearer ${this.configService.get(
          'FLUTTER_WAVE_SECRET_KEY',
        )}`,
      };

      const response: AxiosResponse<any> = await this.httpService
        .post(`${this.flutterwaveBaseUrl}${url}`, data, { headers })
        .toPromise();
      return response.data;
    } catch (error) {
      console.log('error', error);
      throw new BadRequestException('Operation failed');
    }
  }

  async makeFlutterwaveGetRequest(url: string): Promise<any> {
    const headers = {
      Authorization: `Bearer ${this.configService.get(
        'FLUTTER_WAVE_SECRET_KEY',
      )}`,
    };

    const response: AxiosResponse<any> = await this.httpService
      .get(`${this.flutterwaveBaseUrl}${url}`, { headers })
      .toPromise();
    return response.data;
  }

  async initiateFlutterwaveTransaction(url: string, data: any): Promise<any> {
    return this.makeFlutterwavePaymentRequest(url, data);
  }

  async generatePaymentLink(data: paymentLinkDto): Promise<any> {
    try {
      const headers = {
        Authorization: `Bearer ${this.configService.get(
          'FLUTTER_WAVE_SECRET_KEY',
        )}`,
      };
      const response: AxiosResponse<any> = await this.httpService
        .post(
          `${this.flutterwaveBaseUrl}/payments`,
          {
            tx_ref: data.reference,
            amount: data.amount,
            currency: data.currency,
            redirect_url: data.redirectUrl,
            meta: {
              consumer_id: data.customerId,
            },
            customer: {
              email: data.email,
              name: data.customerName,
            },
            customizations: {
              title: 'CPay',
              logo: 'http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png',
            },
          },
          {
            headers,
          },
        )
        .toPromise();

      return response.data;
    } catch (error) {
      Logger.log(error);
      throw new BadRequestException(
        'Sorry, your transaction could not be completed',
      );
    }
  }

  async verifyTransaction(event: string, data): Promise<unknown> {
    try {
      const headers = {
        Authorization: `Bearer ${this.configService.get(
          'FLUTTER_WAVE_SECRET_KEY',
        )}`,
      };
      const eventType: flutterwaveEventTypeEnum =
        event as unknown as flutterwaveEventTypeEnum;
      let url;
      switch (eventType) {
        case flutterwaveEventTypeEnum['charge.completed']:
          url = `${this.flutterwaveBaseUrl}/transactions/${data.id}/verify`;
          break;
        case flutterwaveEventTypeEnum['transfer.completed']:
          url = `${this.flutterwaveBaseUrl}/transfers/${data.id}`;
          break;
        default:
          Logger.log('Cannot verify event type');
          throw new BadRequestException('Cannot verify event type');
      }
      const response: AxiosResponse<any> = await this.httpService
        .get(url, {
          headers,
        })
        .toPromise();

      return response.data;
    } catch (error) {
      Logger.log(error);
      throw new BadRequestException('Something is broken');
    }
  }

  async chargeCard(data: chargeCardDto): Promise<any> {
    try {
      const headers = {
        Authorization: `Bearer ${this.configService.get(
          'FLUTTER_WAVE_SECRET_KEY',
        )}`,
      };
      const response: AxiosResponse<any> = await this.httpService
        .post(
          `${this.flutterwaveBaseUrl}/charges?type=card`,
          {
            card_number: data.cardNumber,
            cvv: data.cvv,
            expiry_month: data.expiryMonth,
            expiry_year: data.expiryYear,
            tx_ref: data.reference,
            amount: data.amount,
            currency: data.currency,
            redirect_url: data.redirectUrl,
            meta: {
              consumer_id: data.customerId,
            },
            enckey: this.configService.get('FLUTTER_WAVE_ENCRYPTION_SECRET'),
            customer: {
              email: data.email,
              name: data.customerName,
            },
            customizations: {
              title: 'Nidi',
              logo: 'http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png',
            },
          },
          {
            headers,
          },
        )
        .toPromise();

      return response.data;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        error.response
          ? error.response.data.message
          : 'Sorry, your transaction could not be completed',
      );
    }
  }

  async getBanks(data: bankListQueryDto): Promise<any> {
    try {
      const headers = {
        Authorization: `Bearer ${this.configService.get(
          'FLUTTER_WAVE_SECRET_KEY',
        )}`,
      };
      const response: AxiosResponse<any> = await this.httpService
        .get(
          `${this.flutterwaveBaseUrl}/banks/${data.currency.slice(
            0,
            -1,
          )}?page=${data.page}`,
          {
            headers,
          },
        )
        .toPromise();
      return response.data;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        error.response
          ? error.response.data.message
          : 'Sorry, your request could not be completed',
      );
    }
  }
}
