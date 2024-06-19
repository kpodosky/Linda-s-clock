import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { BusinessTokenDto } from '../token/dto/token.dto';

@Injectable()
export class BusinessRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;
    if (roles && roles.length === 0)
      throw new NotFoundException('roles guard parameter not provided');
    try {
      const response: Response = context.switchToHttp().getResponse();
      const tokenData = response.locals.tokenData as BusinessTokenDto;
      if (!tokenData)
        throw new NotFoundException('authorization token not passed');

      if (!roles.includes(tokenData.role)) {
        throw new UnauthorizedException(
          'you are not authorized to carry out this action',
        );
      }
      return true;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
