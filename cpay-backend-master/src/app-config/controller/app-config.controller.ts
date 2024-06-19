import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AppConfigService } from '../service/app-config.service';
import { CreateAppConfigDto, FilterAppConfigDto } from '../dto/app-config.dto';
import { appConfigurationsValidator } from '../validator/app-config.validator';
import { BusinessTokenDecorator } from '@app/lib/token/decorator/token.decorator';
import { BusinessTokenDto } from '@app/lib/token/dto/token.dto';
import { ObjectValidationPipe } from '@app/lib/pipe/validation.pipe';

@Controller('app-config')
export class AppConfigController {
  constructor(private readonly appConfigService: AppConfigService) {}

  @Get('fetch')
  async getConfig(
    data: FilterAppConfigDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    const config = await this.appConfigService.findOne({
      where: {
        source: 'clockpay',
      },
    });
    const mappedData = {
      depositChargesInPercent: config.depositChargesInPercent,
      withdrawalCharges: config.withdrawalCharges,
    };
    return { message: 'Config fetched successfully', data: mappedData };
  }
}
