import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminTokenDto, BusinessTokenDto } from '../dto/token.dto';
import { Response } from 'express';

export const BusinessTokenDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const response: Response = ctx.switchToHttp().getResponse();
    return response.locals.tokenData as BusinessTokenDto;
  },
);

export const AdminTokenDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const response: Response = ctx.switchToHttp().getResponse();
    const { email, role } = response.locals.tokenData;

    if (!email || !role) {
      throw new UnauthorizedException('Unauthorized request');
    }

    return response.locals.tokenData as AdminTokenDto;
  },
);

export const UseToken = () => SetMetadata('token', true);
export const AdminToken = () => SetMetadata('token', true);
