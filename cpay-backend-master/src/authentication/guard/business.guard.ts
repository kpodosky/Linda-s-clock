import { BusinessTokenDto } from '@app/lib/token/dto/token.dto';
import {
  BadRequestException,
  CanActivate,
  ConflictException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { OtpService } from 'src/otp/services/otp.service';
import { Response } from 'express';
import { CpayUserService } from 'src/business/service/cpay.user.service';
import { OtpTypeEnum } from 'src/otp/enums/otp.enum';
import { Op } from 'sequelize';
import { verifyPassword } from '@app/lib/function/password.function';

@Injectable()
export class RegistrationEmailVerificationGuard implements CanActivate {
  constructor(
    private readonly cpayUserService: CpayUserService,
    private readonly otpService: OtpService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const response: Response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();
    const token: BusinessTokenDto = response.locals.tokenData;
    const { code } = request.body;
    const getCode = await this.otpService.findOne({
      where: {
        type: OtpTypeEnum.emailConfirmation,
        receiver: token.id,
        code,
      },
    });
    if (!getCode) {
      throw new BadRequestException(
        'It appears that the code or account you provided is not valid. Please verify and try again',
      );
    }
    await this.otpService.verify({
      id: getCode.id,
      type: getCode.type,
      code,
      receiver: token.id,
    });

    return true;
  }
}

@Injectable()
export class UpdateInAppPasswordGuard implements CanActivate {
  constructor(
    private readonly cpayUserService: CpayUserService,
    private readonly otpService: OtpService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const response: Response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();
    const token: BusinessTokenDto = response.locals.tokenData;
    const { oldPassword } = request.body;
    const existingEmail = await this.cpayUserService.findOne({
      where: {
        id: token.id,
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
    const confirmPassword1 = await verifyPassword(
      oldPassword,
      existingEmail.password,
    );
    if (!confirmPassword1) throw new BadRequestException('Invalid password');

    return true;
  }
}
