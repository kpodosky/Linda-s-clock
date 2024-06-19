import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SkipAuthGuard } from '@app/lib/token/dto/token.dto';
import { ObjectValidationPipe } from '@app/lib/pipe/validation.pipe';
import { WaitListService } from '../service/waitlist.service';
import { createSignUpWaitListValidator } from '../validator/waitlist.validator';
import { ContactSalesDto, SignUpWaitlistDto } from '../dto/waitlist.dto';
import { Op } from 'sequelize';
import { WaitlistCategory } from '../enum/waitlist.enum';
import { WaitListEventsEnum } from '../event/waitlist.event';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('general')
export class WaitlistController {
  constructor(
    private readonly waitListService: WaitListService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post('waitlist')
  @SkipAuthGuard()
  @UseGuards()
  async createWaitlist(
    @Body(new ObjectValidationPipe(createSignUpWaitListValidator))
    data: SignUpWaitlistDto,
  ) {
    // TODO: Restrict setting to administrator account only.
    const alreadyWaitlisted = await this.waitListService.findOne({
      where: {
        email: {
          [Op.iLike]: data.email,
        },
      },
    });
    if (alreadyWaitlisted) {
      throw new BadRequestException(
        'Oooops! You have already waitlisted, We will notify you the moment our product launches',
      );
    }
    const waitlist = await this.waitListService.initialize({
      ...data,
      companyName: data.company,
      type: WaitlistCategory.SignUp,
    });
    await waitlist.save();
    const emailData = {
      username: data.fullName,
      email: data.email,
    };
    this.eventEmitter.emitAsync(
      WaitListEventsEnum.SIGN_UP_WAITLIST_NOTIFICATION,
      emailData,
    );
    // TODO: send account verification email
    return {
      message:
        'Congratulations! You are at the front of the line. We will notify you the moment our product launches!',
    };
  }

  @Post('contact-sales')
  @SkipAuthGuard()
  @UseGuards()
  async contactSales(
    @Body(new ObjectValidationPipe(createSignUpWaitListValidator))
    data: ContactSalesDto,
  ) {
    // TODO: Restrict setting to administrator account only.
    const emailData = {
      username: data.name,
      email: data.email,
      reason: data.reason,
    };
    this.eventEmitter.emitAsync(WaitListEventsEnum.CONTACT_SALES, emailData);
    // TODO: send account verification email
    return {
      message:
        'Request submitted successfully! Our sales team will reach out to you shortly.',
    };
  }
}
