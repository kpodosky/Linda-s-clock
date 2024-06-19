import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { BusinessTokenDecorator } from '@app/lib/token/decorator/token.decorator';
import { BusinessTokenDto, SkipAuthGuard } from '@app/lib/token/dto/token.dto';
import { ObjectValidationPipe } from '@app/lib/pipe/validation.pipe';
import { RateService } from '../service/rate.service';
import { filterAllRatesValidator } from '../validator/rate.validator';
import { RateFilterDto } from '../dto/rate.dto';

@Controller('rate')
export class RateController {
  constructor(private readonly rateService: RateService) {}

  @Get('list')
  @SkipAuthGuard()
  @UseGuards()
  async rateList(
    @Query(new ObjectValidationPipe(filterAllRatesValidator))
    data: RateFilterDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    return await this.rateService.search(data);
  }
}
