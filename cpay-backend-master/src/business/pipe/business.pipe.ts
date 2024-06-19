import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Op } from 'sequelize';
import { CpayUserService } from '../service/cpay.user.service';
import { Sequelize } from 'sequelize-typescript';
import { PersonalInformationUpdateDto } from '../dto/cpay.business.dto';

@Injectable()
export class ProfileUpdatePipe implements PipeTransform {
  constructor(private readonly cpayUserService: CpayUserService) {}

  async transform(data: PersonalInformationUpdateDto) {
    const { phoneNumber } = data;

    if (phoneNumber) {
      const phoneExists = await this.cpayUserService.propExists({
        where: {
          [Op.or]: [
            Sequelize.literal(
              `"phoneNumber"->>'code' = '${phoneNumber.code}' AND "phoneNumber"->>'number' = '${phoneNumber.number}'`,
            ),
          ],
        },
      });
      if (phoneExists) {
        throw new BadRequestException('Phone number already exists');
      }
    }
    return data;
  }
}
