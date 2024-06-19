import {
  BadRequestException,
  ConflictException,
  Injectable,
  PipeTransform,
  UnauthorizedException,
} from '@nestjs/common';
import { Op } from 'sequelize';
import { CpayUserService } from 'src/business/service/cpay.user.service';
import {
  AccountLoginDto,
  AccountRegistrationDto,
  ForgotPasswordConfirmDto,
  UpdatePasswordDto,
} from '../dto/authentication.dto';
import { OtpService } from 'src/otp/services/otp.service';
import { OtpTypeEnum } from 'src/otp/enums/otp.enum';
import { verifyPassword } from '@app/lib/function/password.function';
import { AppConfigService } from 'src/app-config/service/app-config.service';

@Injectable()
export class BusinessRegistrationPipe implements PipeTransform {
  constructor(private readonly cpayUserService: CpayUserService) {}

  async transform(customer: AccountRegistrationDto) {
    const existingEmail = await this.cpayUserService.propExists({
      where: {
        email: {
          [Op.iLike]: customer.email,
        },
      },
    });
    if (existingEmail) {
      throw new ConflictException('Account already registered');
    }

    return customer;
  }
}

@Injectable()
export class BusinessLoginPipe implements PipeTransform {
  constructor(
    private readonly cpayUserService: CpayUserService,
    private readonly appConfigService: AppConfigService,
  ) {}

  async transform(customer: AccountLoginDto) {
    const config = await this.appConfigService.findOne({
      where: {
        source: 'clockpay',
      },
    });
    if (!config.isLoginAvailable) {
      throw new ConflictException(
        'System is not available, please try again later',
      );
    }
    const existingEmail = await this.cpayUserService.findOne({
      where: {
        email: {
          [Op.iLike]: customer.email,
        },
        deletedAt: {
          [Op.is]: null || undefined,
        },
      },
      attributes: {
        include: ['password'],
      },
      paranoid: false,
    });
    if (!existingEmail) {
      throw new ConflictException('Invalid login credentials');
    }
    if (!existingEmail.password)
      throw new BadRequestException('Kindly set your password to continue');
    const confirmPassword = await verifyPassword(
      customer.password,
      existingEmail.password,
    );
    if (!confirmPassword)
      throw new BadRequestException('Invalid login credentials');

    return customer;
  }
}

@Injectable()
export class ForgotPasswordConfirmPipe implements PipeTransform {
  constructor(
    private readonly cpayUserService: CpayUserService,
    private readonly otpService: OtpService,
  ) {}

  async transform(customer: ForgotPasswordConfirmDto) {
    const { code, userId } = customer;
    const user = await this.cpayUserService.findOne({
      where: { id: userId },
      attributes: {
        include: ['passwordChange'],
      },
    });
    if (!user) {
      throw new BadRequestException(
        'It appears that the code or account you provided is not valid. Please verify and try again',
      );
    }
    const otp = await this.otpService.findOne({
      where: { type: OtpTypeEnum.PasswordReset, receiver: user.id },
    });
    if (!otp) {
      throw new BadRequestException(
        'It appears that the code or account you provided is not valid. Please verify and try again',
      );
    }
    await this.otpService.verify({
      code,
      receiver: user.id,
      type: OtpTypeEnum.PasswordReset,
      id: otp.id,
    });
    user.passwordChange = {
      ...user.passwordChange,
      confirmChange: true,
      ready: true,
    };
    await user.save();
    return customer;
  }
}

@Injectable()
export class UpdatePasswordPipe implements PipeTransform {
  constructor(private readonly cpayUserService: CpayUserService) {}

  async transform(customer: UpdatePasswordDto) {
    const { password, confirmPassword, userId } = customer;
    if (password !== confirmPassword) {
      throw new BadRequestException(
        'Passwords do not match. Please make sure your password and confirm password match.',
      );
    }
    const user = await this.cpayUserService.findOne({
      where: {
        id: userId,
      },
      attributes: {
        include: ['password', 'passwordChange'],
      },
    });
    if (!user) {
      throw new BadRequestException(
        'It appears that the code or account you provided is not valid. Please verify and try again',
      );
    }
    console.log(user?.passwordChange);
    if (!user?.passwordChange?.confirmChange) {
      throw new BadRequestException(
        'You need to verify password reset OTP to continue. Please verify and try again',
      );
    }
    if (!user?.passwordChange?.ready) {
      throw new UnauthorizedException('Unauthorized operation');
    }
    user.passwordChange = {
      ...user.passwordChange,
      ready: false,
    };
    await user.save();
    return customer;
  }
}
