import {
  CanActivate,
  ConflictException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AdminService } from '../service/admin.service';
import { Response } from 'express';
import { AdminRoleService } from '../service/admin.role.service';
import { AdminTokenDto } from '@app/lib/token/dto/token.dto';

@Injectable()
export class MinimumAdminRoleGuard implements CanActivate {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminRoleService: AdminRoleService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const response: Response = context.switchToHttp().getResponse();
    const token: AdminTokenDto = response.locals.tokenData;
    const admin = await this.adminService.findById(token.id);
    const role = await this.adminRoleService.findById(token.id);
    if (admin.roleId)
      throw new ConflictException('Verify your email to complete this request');
    return true;
  }
}