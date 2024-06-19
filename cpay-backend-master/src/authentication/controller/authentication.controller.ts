import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ObjectValidationPipe } from '@app/lib/pipe/validation.pipe';
import { BusinessTokenDecorator } from '@app/lib/token/decorator/token.decorator';
import {
  BusinessTokenDto,
  SkipAuthGuard,
  SkipTwoFactorAuthGuard,
} from '@app/lib/token/dto/token.dto';
import { CpayUserService } from 'src/business/service/cpay.user.service';
import {
  emailVerificationCodeValidator,
  inAppPasswordUpdateValidator,
  loginValidator,
  passwordResetCodeValidator,
  passwordResetValidator,
  passwordUpdateVaildator,
  qrCodeVerificationValidator,
  registrationValidator,
} from '../validator/authentication.validator';
import {
  AccountEmailConfirmDto,
  AccountLoginDto,
  AccountRegistrationDto,
  ForgotPasswordConfirmDto,
  ForgotPasswordDto,
  UpdatePasswordDto,
} from '../dto/authentication.dto';
import {
  BusinessLoginPipe,
  BusinessRegistrationPipe,
  ForgotPasswordConfirmPipe,
  UpdatePasswordPipe,
} from '../pipe/authentication.pipe';
import { TokenService } from '@app/lib/token/service/token.service';
import { Op } from 'sequelize';
import { CpayBusiness } from 'src/business/model/cpay.business.model';
import { hashPassword } from '@app/lib/function/password.function';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthenticationEventEnums } from '../event/authentication.business.event';
import { RegistrationEmailVerificationGuard } from '../guard/business.guard';
import { CpayBusinessConfiguration } from 'src/business/model/cpay.business.configuration.model';
import { CpayBusinessProfile } from 'src/business/model/cpay.business.profile.model';
import { Wallet } from 'src/wallet/model/wallet.model';
import { AuthenticationService } from '../service/authentication.service';
import { CpayBusinessLocation } from 'src/business/model/cpay.business.location.model';
import { CpayLoginDeviceService } from 'src/business/service/cpay.login.device.service';
import { ConfigService } from '@nestjs/config';
import { CustomRequest } from '@app/lib/interceptors/ip.interceptor';

@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly cpayUserService: CpayUserService,
    private readonly eventEmitter: EventEmitter2,
    private readonly authenticationService: AuthenticationService,
    private readonly cpayLoginDeviceService: CpayLoginDeviceService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @SkipAuthGuard()
  async register(
    @Body(
      new ObjectValidationPipe(registrationValidator),
      BusinessRegistrationPipe,
    )
    data: AccountRegistrationDto,
  ) {
    const user = this.cpayUserService.initialize({
      ...data,
      password: await hashPassword(data.password),
    });
    await user.save();
    const token = await this.tokenService.tokenize({
      data: {
        id: user.id,
        email: user.email,
      },
    });
    const emailData = {
      username: data.firstName + ' ' + data.lastName,
      subject: 'Email Verification OTP',
      email: data.email,
      receiver: user.id,
    };
    this.eventEmitter.emitAsync(
      AuthenticationEventEnums.EMAIL_VERIFICATION_EMAIL_OTP,
      emailData,
    );
    user.lastToken = token;
    await user.save();
    return { message: 'Account registered successfully', token };
  }

  @Post('login')
  @SkipAuthGuard()
  async login(
    @Body(new ObjectValidationPipe(loginValidator), BusinessLoginPipe)
    data: AccountLoginDto,
    @Req() req: CustomRequest,
  ) {
    const user = await this.cpayUserService.findOne({
      where: {
        email: {
          [Op.iLike]: data.email,
        },
      },
    });
    const token = await this.tokenService.tokenize({
      data: {
        id: user.id,
        email: user.email,
        ip: req.clientIp,
      },
    });
    user.lastToken = token;
    await user.save();
    user.lastToken = undefined;
    user.passwordChange = undefined;
    const name = user.firstName
      ? `${user.firstName} ${user.lastName}`
      : 'Customer';
    const LoginData = {
      userId: user.id,
      os: req.deviceInfo.os.name ?? null,
      ip: req.clientIp,
      version: req.deviceInfo.model,
      userAgent: req.userAgent,
      longitude: req.location ? req.location.longitude : null,
      latitude: req.location ? req.location.latitude : null,
    };
    this.eventEmitter.emitAsync(
      AuthenticationEventEnums.LOGIN_ACTIVITY_LOG,
      LoginData,
    );
    const Details = {
      username: name,
      email: user.email,
      link: this.configService.get('FRONTEND_URL'),
    };
    // this.eventEmitter.emitAsync(AuthenticationEventEnums.LOGIN_ALERT, Details);
    if (user.authentication.googleAuthentication) {
      await this.cpayUserService.findByIdAndUpdate(user.id, {
        authVerified: false,
      });
    }
    return { data: user, token };
  }

  @Post('generate-qrcode')
  @SkipTwoFactorAuthGuard()
  async generateQRCode(@BusinessTokenDecorator() token: BusinessTokenDto) {
    const qrCode = await this.authenticationService.generateQRCode(token.id);

    return {
      message: 'QRCode generated successfully',
      data: {
        qrCode,
      },
    };
  }

  @Post('verify-qrcode')
  @SkipTwoFactorAuthGuard()
  async verifyQRCode(
    @Body(new ObjectValidationPipe(qrCodeVerificationValidator))
    customer: AccountEmailConfirmDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    const user = await this.cpayUserService.findById(token.id);
    const qrCode = await this.authenticationService.verifyQRCode(
      token.id,
      customer.code,
    );
    if (!user.authentication.googleAuthentication) {
      await this.cpayUserService.findByIdAndUpdate(token.id, {
        authentication: {
          googleAuthentication: true,
        },
      });
    }
    if (qrCode) {
      await this.cpayUserService.findByIdAndUpdate(token.id, {
        authVerified: true,
      });
    }
    const user2 = await this.cpayUserService.findById(token.id);

    return {
      message: qrCode ? 'OTP verified successfully' : 'Invalid OTP',
      data: {
        verification: qrCode,
        user: user2,
      },
    };
  }

  @Get('profile')
  async profile(@BusinessTokenDecorator() token: BusinessTokenDto) {
    const user = await this.cpayUserService.findOne({
      where: {
        id: token.id,
      },
      include: [
        {
          model: CpayBusiness,
          as: 'businesses',
          include: [
            {
              model: CpayBusinessConfiguration,
              as: 'configuration',
            },
            {
              model: CpayBusinessProfile,
              as: 'profile',
            },
            {
              model: Wallet,
              as: 'wallets',
            },
            {
              model: CpayBusinessLocation,
              as: 'location',
            },
          ],
        },
      ],
    });
    user.passwordChange = undefined;
    const percentage = user.getPercentage();
    return { data: user, percentage };
  }

  @Post('resend-email-verification-code')
  async resendEmailVeirificationCode(
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    const user = await this.cpayUserService.findById(token.id);

    if (user) {
      const emailData = {
        username: user.firstName + ' ' + user.lastName,
        subject: 'Email Verification OTP',
        email: user.email,
        receiver: user.id,
      };
      this.eventEmitter.emitAsync(
        AuthenticationEventEnums.EMAIL_VERIFICATION_EMAIL_OTP,
        emailData,
      );
    }

    return {
      message: 'Email verification code sent successfully',
      data: {
        id: user ? user.id : '',
      },
    };
  }

  @Post('confirm-account-email')
  @UseGuards(RegistrationEmailVerificationGuard)
  async confirmAccountEmail(
    @Body(new ObjectValidationPipe(emailVerificationCodeValidator))
    customer: UpdatePasswordDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    const user = await this.cpayUserService.findById(token.id);
    user.verification = {
      ...user.verification,
      emailVerified: true,
    };
    await user.save();
    // TODO: Confirm if user needs to get a confirmation email
    return {
      message: 'Email verification successful',
    };
  }

  @Post('forgot-password')
  @SkipAuthGuard()
  async forgotPassword(
    @Body(new ObjectValidationPipe(passwordResetValidator))
    data: ForgotPasswordDto,
  ) {
    const user = await this.cpayUserService.findOne({
      where: {
        email: {
          [Op.iLike]: data.email,
        },
      },
      attributes: {
        include: ['passwordChange'],
      },
    });

    if (user) {
      const name = user.firstName
        ? `${user.firstName} ${user.lastName}`
        : 'Customer';
      const emailData = {
        username: name,
        subject: 'Password Reset',
        email: data.email,
        receiver: user.id,
      };
      user.passwordChange
        ? (user.passwordChange.confirmChange = false)
        : (user.passwordChange = {
            ...user.passwordChange,
            confirmChange: true,
            lastUpdated: new Date(),
          });
      await user.save();
      this.eventEmitter.emitAsync(
        AuthenticationEventEnums.SEND_PASSWORD_RESET_EMAIL,
        emailData,
      );
    }

    return {
      message: 'Password reset email sent successfully',
      data: {
        id: user ? user.id : '',
      },
    };
  }

  @Post('forgot-password/confirm')
  @SkipAuthGuard()
  async forgotPasswordConfirm(
    @Body(
      new ObjectValidationPipe(passwordResetCodeValidator),
      ForgotPasswordConfirmPipe,
    )
    customer: ForgotPasswordConfirmDto,
  ) {
    return {
      message: 'Password reset code confirmed successfully',
      id: customer.userId,
    };
  }

  @Post('forgot-password/update-password')
  @SkipAuthGuard()
  async updatePassword(
    @Body(new ObjectValidationPipe(passwordUpdateVaildator), UpdatePasswordPipe)
    customer: UpdatePasswordDto,
  ) {
    const user = await this.cpayUserService.findById(customer.userId);
    user.password = await hashPassword(customer.password);
    await user.save();
    // TODO: Confirm if user needs to get a confirmation email
    return {
      message: 'Password updated successfully',
    };
  }

  @Patch('in-app-update-password')
  async inAppUpdatePassword(
    @Body(
      new ObjectValidationPipe(inAppPasswordUpdateValidator),
      UpdatePasswordPipe,
    )
    customer: UpdatePasswordDto,
  ) {
    const user = await this.cpayUserService.findById(customer.userId);
    user.password = await hashPassword(customer.password);
    await user.save();
    // TODO: Confirm if user needs to get a confirmation email
    return {
      message: 'Password updated successfully',
    };
  }
}
