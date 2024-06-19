import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BankAccountService } from '../service/bank.service';
import {
  addBankAccountValidator,
  removeBankAccountValidator,
  supportedBanksQueryValidator,
  supportedBanksValidator,
  verifyBankValidator,
} from '../validator/bank.vaildator';
import {
  AddBankAccountDto,
  BankAccountSearchValidatorDto,
  BankDetailsVerificationDto,
  RemoveBankAccountDto,
  bankListQueryDto,
} from '../dto/bank.dto';
import { ObjectValidationPipe } from '@app/lib/pipe/validation.pipe';
import { BusinessTokenDecorator } from '@app/lib/token/decorator/token.decorator';
import { BusinessTokenDto } from '@app/lib/token/dto/token.dto';
import { FlutterwaveService } from 'src/fluterwave/service/flutterwave.service';
import { DuplicateBankAdditionPipe } from '../pipe/bank.pipe';

@Controller('bank')
export class BankAccountController {
  constructor(
    private readonly bankAccountService: BankAccountService,
    private readonly flutterwaveService: FlutterwaveService,
  ) {}

  @Post('add')
  @UseGuards()
  async addBankAccount(
    @Body(
      new ObjectValidationPipe(addBankAccountValidator),
      DuplicateBankAdditionPipe,
    )
    data: AddBankAccountDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    const bank = this.bankAccountService.initialize(data);
    await bank.save();

    return {
      message: 'Account added successfully',
    };
  }

  @Post('remove')
  @UseGuards()
  async removeBankAccount(
    @Body(new ObjectValidationPipe(removeBankAccountValidator))
    data: RemoveBankAccountDto,
  ) {
    await this.bankAccountService.findOneOrErrorOut({
      where: { id: data.bankAccountId },
    });
    await this.bankAccountService.findByIdAndUpdate(data.bankAccountId, {
      active: false,
    });

    return {
      message: 'Account removed successfully',
    };
  }

  @Get('all')
  @UseGuards()
  async Search(
    @Query(new ObjectValidationPipe(supportedBanksQueryValidator))
    query: BankAccountSearchValidatorDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    return await this.bankAccountService.search(query);
  }

  @Get('list')
  @UseGuards()
  async bankSearch(
    @Query(new ObjectValidationPipe(supportedBanksValidator))
    query: bankListQueryDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    const paginationResult = await this.flutterwaveService.getBanks(query);

    return {
      data: paginationResult,
    };
  }

  @Post('verify-bank-details')
  async VerifyBank(
    @Body(new ObjectValidationPipe(verifyBankValidator))
    data: BankDetailsVerificationDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    try {
      const verify =
        await this.flutterwaveService.initiateFlutterwaveTransaction(
          '/accounts/resolve',
          {
            account_number: data.accountNumber,
            account_bank: data.bankCode,
          },
        );
      return {
        message: 'Banks retrieved successfully',
        data: verify.data,
      };
    } catch (error) {
      Logger.debug('FLUTTERWAVE BANK VERIFICATION ERROR LOG CRITICAL', error);
      if (error.response.status < 500) {
        const message = error.response.data.message.startsWith(
          'Unknown bank code:',
        )
          ? 'Sorry your bank is not supported for Payouts, please choose another bank and try again'
          : error.response.data.message;
        throw new BadRequestException(message);
      } else {
        throw new BadRequestException('Invalid operation', error.toString());
      }
    }
  }
}
