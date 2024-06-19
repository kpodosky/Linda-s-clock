import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';
import { BusinessAccountModeEnum } from 'src/business/enum/business.enum';

@Injectable()
export class FireBlocksService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async makePostRequestToFireBlocks(
    url: string,
    data: any,
    mode: BusinessAccountModeEnum,
    endUserId?: string,
  ): Promise<any> {
    const templatePath = path.join(__dirname, '..', `fireblocks_secret.key`);
    const apiSecret = fs.readFileSync(templatePath, 'utf-8');
    // const apiKey = await this.businessService.ModeCheckForApiKey(
    //   mode as BusinessAccountModeEnum,
    // );
    const apiKey = 'dwdwd';
    Logger.log('Post request to firblocks API...', url);

    const baseUrl = this.configService.get('FIRE_BLOCK_BASE_URL');

    // Generate a unique nonce for each request
    const nonce = 'this.businessService.genereateUUID()';
    const iatInSeconds = Math.floor(Date.now() / 1000);
    // const exp = iatInSeconds * 55;
    const normalizedUrl = `/v1${url}`;

    // Create the payload for the JWT
    const payload = {
      uri: normalizedUrl,
      nonce,
      iat: iatInSeconds,
      exp: iatInSeconds + 55,
      sub: apiKey,
      bodyHash: crypto
        .createHash('sha256')
        .update(JSON.stringify(data || ''))
        .digest()
        .toString('hex'),
    };

    // Sign the payload with the API secret key
    const jwtToken = jwt.sign(payload, apiSecret, { algorithm: 'RS256' });

    // Set the headers for the request
    const headers = {
      'X-API-Key': apiKey,
      Authorization: `Bearer ${jwtToken}`,
      ...(endUserId && { 'X-End-User-Wallet-Id': endUserId }),
    };

    // Make the POST request
    try {
      const response: AxiosResponse<any> = await this.httpService
        .post(`${baseUrl}${normalizedUrl}`, data, { headers })
        .toPromise();

      return response.data;
    } catch (error) {
      // Handle errors, log them, or throw a custom exception
      console.error('Error making POST request to FireBlocks:', error.message);
      throw error;
    }
  }

  async makeGetRequestToFireBlocks(
    url: string,
    mode: BusinessAccountModeEnum,
  ): Promise<any> {
    const templatePath = path.join(__dirname, '..', `fireblocks_secret.key`);
    const apiSecret = fs.readFileSync(templatePath, 'utf-8');
    // const apiKey = await this.businessService.ModeCheckForApiKey(
    //   mode as BusinessAccountModeEnum,
    // );
    const apiKey = 'dwdwd';
    Logger.log('Get request to firblocks API...', url);

    const baseUrl = this.configService.get('FIRE_BLOCK_BASE_URL');

    // Generate a unique nonce for each request
    const nonce = 'lll';
    // const nonce = this.businessService.genereateUUID();
    const iatInSeconds = Math.floor(Date.now() / 1000);
    const normalizedUrl = `/v1${url}`;

    // Create the payload for the JWT
    const payload = {
      uri: normalizedUrl,
      nonce,
      iat: iatInSeconds,
      exp: iatInSeconds + 55,
      sub: apiKey,
      bodyHash: crypto
        .createHash('sha256')
        .update(JSON.stringify(''))
        .digest()
        .toString('hex'),
    };

    // Sign the payload with the API secret key
    const jwtToken = jwt.sign(payload, apiSecret, { algorithm: 'RS256' });

    // Set the headers for the request
    const headers = {
      'X-API-Key': apiKey,
      Authorization: `Bearer ${jwtToken}`,
    };

    // Make the POST request
    try {
      const response: AxiosResponse<any> = await this.httpService
        .get(`${baseUrl}${normalizedUrl}`, { headers })
        .toPromise();

      return response.data;
    } catch (error) {
      // Handle errors, log them, or throw a custom exception
      console.error('Error making POST request to FireBlocks:', error.message);
      throw error;
    }
  }
}
