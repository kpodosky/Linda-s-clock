import {
  Injectable,
  NestMiddleware,
  BadRequestException,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from '../token/service/token.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response, NextFunction } from 'express';
import { CpayUserService } from 'src/business/service/cpay.user.service';
import { CustomRequest } from '../interceptors/ip.interceptor';
import { AdminService } from 'src/admin/service/admin.service';

@Injectable()
export class BusinessTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly tokenService: TokenService,
    private readonly cpayUserService: CpayUserService,
    private readonly adminService: AdminService,
  ) {}
  async use(req: CustomRequest, res: Response, next: NextFunction) {
    console.log('req.clientIp************', req.clientIp);
    if (!req.headers.authorization)
      throw new UnauthorizedException('please provide valid login token');

    const authorizationHeader = req.headers.authorization;
    const [bearer, token] = authorizationHeader.split(' ');

    if (token === 'null' || token === null)
      throw new BadRequestException('session expired');
    if (bearer !== 'Bearer') {
      throw new BadRequestException('please provide valid login token');
    }

    if (!token) {
      throw new BadRequestException('please provide valid login token');
    }
    const lastToken = await this.cpayUserService.findOne({
      where: { lastToken: token },
    });
    const adminLastToken = await this.adminService.findOne({
      where: { lastToken: token },
    });
    if (!lastToken && !adminLastToken)
      throw new BadRequestException('please provide valid login token');
    const tokenData = await this.tokenService.verifyBusinessToken(token);
    res.locals.tokenData = tokenData;
    next();
  }
}

@Injectable()
export class GoogleTokenGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext) {
    const activate = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    return activate;
  }
}
