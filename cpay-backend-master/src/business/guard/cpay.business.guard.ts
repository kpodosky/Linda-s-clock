import { BusinessTokenDto } from '@app/lib/token/dto/token.dto';
import {
  BadRequestException,
  CanActivate,
  ConflictException,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { CpayUserService } from '../service/cpay.user.service';
import { Op } from 'sequelize';
import { CpayBusinessService } from '../service/cpay.business.service';
import { OtpService } from 'src/otp/services/otp.service';
import { BusinessAccountMemberRoleEnum } from '../enum/business.enum';
import { OtpTypeEnum } from 'src/otp/enums/otp.enum';
import { CypayUserRoleService } from '../service/cpay.user.role.service';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class CreateBusinessAccountGuard implements CanActivate {
  constructor(private readonly cpayBusinessService: CpayBusinessService) {}
  async canActivate(context: ExecutionContext) {
    const response: Response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();
    const { name } = request.body;
    const token: BusinessTokenDto = response.locals.tokenData;
    const business = await this.cpayBusinessService.findOne({
      where: {
        name: {
          [Op.iLike]: name,
        },
      },
    });
    if (business)
      throw new ConflictException('Business name already registered');
    return true;
  }
}

@Injectable()
export class BusinessOwnerGuard implements CanActivate {
  constructor(
    private readonly otpService: OtpService,
    private readonly cypayUserRoleService: CypayUserRoleService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const response: Response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();
    const { email, businessId } = request.body;

    const token: BusinessTokenDto = response.locals.tokenData;
    if (token.role !== BusinessAccountMemberRoleEnum.owner)
      throw new UnauthorizedException('Unauthorized request');
    const otp = await this.otpService.findOne({
      where: { type: OtpTypeEnum.emailConfirmation, receiver: token.id },
    });

    return true;
  }
}

@Injectable()
export class PersonalProfileGuard implements CanActivate {
  constructor(
    private readonly cpayUserService: CpayUserService,
    private readonly cypayUserRoleService: CypayUserRoleService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const response: Response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();
    const { phoneNumber } = request.body;

    const token: BusinessTokenDto = response.locals.tokenData;
    console.log('.......', request);
    const phoneExists = await this.cpayUserService.propExists({
      where: {
        [Op.or]: [
          Sequelize.literal(
            `"phoneNumber"->>'code' = '${phoneNumber.code}' AND "phoneNumber"->>'number' = '${phoneNumber.number}'`,
          ),
        ],
      },
    });
    if (phoneExists) {
      throw new BadRequestException('Phone number already exists');
    }

    return true;
  }
}
