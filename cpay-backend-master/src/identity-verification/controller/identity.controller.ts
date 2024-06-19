import { Controller, Get, UseGuards } from '@nestjs/common';
import { BusinessTokenDto } from '@app/lib/token/dto/token.dto';
import { BusinessTokenDecorator } from '@app/lib/token/decorator/token.decorator';
import { IdentityTypeEnum } from '../enum/identity.enum';
@Controller('identity')
export class IdentityVerifcationController {
  // constructor() {}

  @Get('options')
  @UseGuards()
  async levelOneVerification(
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    const data = [
      {
        name: 'Passport',
        code: IdentityTypeEnum.passport,
      },
      {
        name: "Driver's License",
        code: IdentityTypeEnum.driverLicense,
      },
      {
        name: 'Government Issued Identity Card',
        code: IdentityTypeEnum.governmentId,
      },
    ];

    return { message: 'Verification type retrieved successfully', data };
  }
}
