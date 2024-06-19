import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { BankAccountService } from '../service/bank.service';
import { AddBankAccountDto } from '../dto/bank.dto';

@Injectable()
export class DuplicateBankAdditionPipe implements PipeTransform {
  constructor(private readonly bankAccountService: BankAccountService) {}
  async transform(data: AddBankAccountDto) {
    const bank = await this.bankAccountService.findOne({
      where: {
        businessId: data.businessId,
        accountNumber: data.accountNumber,
        active: true,
      },
    });
    if (bank) throw new BadRequestException('Account already exists');
    return data;
  }
}
