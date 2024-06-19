import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IdentityVerificationService {
  private readonly premblyUrl: string = 'https://api.myidentitypay.com/api';
  private readonly premblyUrl2: string = 'https://api.prembly.com/identitypass';
  private readonly dojahUrl: string = 'https://api.dojah.io/api/v1';

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async makeIdentityPassRequest(url: string, data: any): Promise<any> {
    const headers = {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'x-api-key': this.configService.get('IDENTITYPASS_SEC_KEY'),
      'app-id': this.configService.get('IDENTITYPASS_APP_ID'),
    };

    const response: AxiosResponse<any> = await this.httpService
      .post(`${this.premblyUrl2}${url}`, data, { headers })
      .toPromise();
    return response.data;
  }
}
