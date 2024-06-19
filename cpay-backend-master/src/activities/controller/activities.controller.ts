import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ObjectValidationPipe } from '@app/lib/pipe/validation.pipe';
import { BusinessTokenDecorator } from '@app/lib/token/decorator/token.decorator';
import { BusinessTokenDto } from '@app/lib/token/dto/token.dto';
import { FilterActivityDto, UpdateActivityDto } from '../dto/activities.dto';
import { ActivityService } from '../service/activities.service';
import {
  BusinessActivitiesFilterValidator,
  BusinessActivitiesUpdateValidator,
} from '../validator/activities.validator';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('lists')
  @UseGuards()
  async transactions(
    @Query(new ObjectValidationPipe(BusinessActivitiesFilterValidator))
    query: FilterActivityDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    console.log('token....', token)
    query.memberId = token.id;
    return await this.activityService.search(query);
  }

  @Post('update-as-read')
  @UseGuards()
  async updateAsRead(
    @Body(new ObjectValidationPipe(BusinessActivitiesUpdateValidator))
    data: UpdateActivityDto,
  ) {
    await this.activityService.findByIdAndUpdate(data.activityId, {
      read: true,
    });

    return {
      message: 'Activity marked as read successfully',
    };
  }
}
