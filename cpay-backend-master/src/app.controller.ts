import { Controller, Get, SerializeOptions } from '@nestjs/common';
import { AppService } from './app.service';
import { SkipThrottle } from '@nestjs/throttler';
import { SkipAuthGuard } from '@app/lib/token/dto/token.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @SkipAuthGuard()
  @SkipThrottle()
  @SerializeOptions({ strategy: 'exposeAll' })
  health() {
    return this.appService.health();
  }

}
