import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';

@Injectable()
export class IdentityVerificationService {
  private readonly premblyUrl: string = 'https://api.myidentitypay.com/api';
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
      .post(`${this.premblyUrl}${url}`, data, { headers })
      .toPromise();
    return response.data;
  }
}
