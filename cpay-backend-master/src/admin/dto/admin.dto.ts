import { PaginationDto } from '@app/lib/dto/pagination.dto';
import { ClockPayGraphTypeEnum } from '@app/lib/enum/login.enum';
import { WalletCurrencyEnum } from 'src/wallet/enum/wallet.enum';

export class AdminAccessRequestDto {
  fullName: string;
  email: string;
  roleId: string;
  invitedBy: string;
}

export class AdminRemoveAccessDto {
  memberId: string;
}

export class UpdateUpdateRoleRoleDto {
  adminId: string;
  roleId: string;
}

export class AdminFilterDto extends PaginationDto {
  fullName: string;
  email: string;
  status: boolean;
  role: string;
  permissions: string;
  adminId: string;
}

export class AdminForgotPasswordDto {
  email: string;
}

export class AdminForgotPasswordConfirmDto {
  code: string;
  adminId: string;
}

export class AdminUpdatePasswordDto {
  adminId: string;
  password: string;
  confirmPassword: string;
}

export class UpdateAdminAccessRequestDto {
  status: string;
  adminId: string;
}

export class AdminLoginDto {
  email: string;
  password: string;
}

export class EditAminPProfileVaildatorDto {
  fullName: string;
  profilePicture: string;
}

export class EditAminMemberProfileVaildatorDto {
  fullName: string;
  profilePicture: string;
  adminId: string;
}

export class updateAdminAccountStatusDto {
  adminId: string;
}

export class AdminDashabordSumFilterDto extends PaginationDto {
  currency: WalletCurrencyEnum;
}


export class UserBusinessTrendFilter {
  period: ClockPayGraphTypeEnum;
}