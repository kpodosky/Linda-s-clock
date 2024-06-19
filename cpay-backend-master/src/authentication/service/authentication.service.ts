import { Injectable } from '@nestjs/common';
import { CpayUserService } from 'src/business/service/cpay.user.service';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import * as speakeasy from 'speakeasy';

@Injectable()
export class AuthenticationService {
  constructor(private readonly cpayUserService: CpayUserService) {}
  async generateQRCode(userId: string): Promise<string> {
    const user = await this.cpayUserService.findById(userId);
    // Generate a secret key for the user
    const secret = speakeasy.generateSecret({ length: 20 });

    // Save the secret key to the user record
    if (!user.qrcode) {
      await this.cpayUserService.findByIdAndUpdate(userId, {
        qrcode: secret.base32,
      });
    }

    // Generate the QR code URL
    const otpauth = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: user.email,
      issuer: 'Clockpay',
    });
    const qrCodeUrl = await qrcode.toDataURL(otpauth);

    return qrCodeUrl;
  }

  async verifyQRCode(userId, code) {
    const user = await this.cpayUserService.findById(userId);
    console.log('user.qrcode', user.qrcode);
    const isValid = speakeasy.totp.verify({
      secret: user.qrcode,
      encoding: 'base32',
      token: code,
    });
    console.log('isValid...', isValid);
    return isValid;
  }
}
