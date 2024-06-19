import {
  BadRequestException,
  ConflictException,
  Injectable,
  PipeTransform,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminRoleService } from '../service/admin.role.service';
import { AdminService } from '../service/admin.service';
import {
  AdminAccessRequestDto,
  AdminForgotPasswordConfirmDto,
  AdminLoginDto,
} from '../dto/admin.dto';
import { AdminAccountStatusEnum } from '../enum/admin.enum';
import { Op } from 'sequelize';
import { OtpService } from 'src/otp/services/otp.service';
import { OtpTypeEnum } from 'src/otp/enums/otp.enum';
import { CpayUserService } from 'src/business/service/cpay.user.service';
import { verifyPassword } from '@app/lib/function/password.function';

@Injectable()
export class AdminAccessRequestPipe implements PipeTransform {
  constructor(
    private readonly adminRoleService: AdminRoleService,
    private readonly adminService: AdminService,
  ) {}
  async transform(data: AdminAccessRequestDto) {
    const confirmRole = await this.adminRoleService.findById(data.roleId);
    if (!confirmRole) throw new BadRequestException('Invalid selected role');

    const accountExist = await this.adminService.findOne({
      where: {
        email: {
          [Op.iLike]: data.email,
        },
      },
    });
    // if (accountExist) throw new BadRequestException('Account already exist');
    if (accountExist && accountExist.status === AdminAccountStatusEnum.Accepted)
      throw new BadRequestException('Account already exist');

    return data;
  }
}

@Injectable()
export class AdminLoginUserPipe implements PipeTransform {
  constructor(private readonly adminService: AdminService) {}
  async transform(customer: AdminLoginDto) {
    const accountExist = await this.adminService.findOne({
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
    });
    if (!accountExist) throw new BadRequestException('Invalid credentials');
    if (accountExist.status === AdminAccountStatusEnum.Blocked)
      throw new UnauthorizedException(
        'Admin access has been retrieved from this account',
      );
    if (accountExist.status === AdminAccountStatusEnum.Pending)
      throw new UnauthorizedException('Admin access request is still pending');

    const passwordCheck = await verifyPassword(
      customer.password,
      accountExist.password,
    );
    if (!passwordCheck) throw new BadRequestException('Invalid credentials');
    return customer;
  }
}

@Injectable()
export class AdminConfirm2FACodePipe implements PipeTransform {
  constructor(
    private readonly adminService: AdminService,
    private readonly otpService: OtpService,
  ) {}

  async transform(data: AdminForgotPasswordConfirmDto) {
    const { code, adminId } = data;
    const admin = await this.adminService.findOne({
      where: { id: adminId },
      attributes: {
        include: ['password'],
      },
    });
    if (!admin) {
      throw new BadRequestException(
        'It appears that the code or account you provided is not valid. Please verify and try again',
      );
    }
    const otp = await this.otpService.findOne({
      where: { type: OtpTypeEnum.Email, receiver: admin.id },
    });
    console.log('admin......', admin.fullName);
    if (!otp) {
      throw new BadRequestException(
        'It appears that the code or account you provided is not valid. Please verify and try again',
      );
    }
    await this.otpService.verify({
      code,
      receiver: admin.id,
      type: OtpTypeEnum.Email,
      id: otp.id,
    });
    console.log('admin......', admin.email);
    return data;
  }
}
