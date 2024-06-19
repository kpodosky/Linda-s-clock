import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BankAccountController } from './controller/bank.controller';
import { BankAccountService } from './service/bank.service';
import { Bank } from './model/bank.model';

@Module({
  controllers: [BankAccountController],
  providers: [BankAccountService, BankAccountService],
  imports: [SequelizeModule.forFeature([Bank])],
  exports: [BankAccountService],
})
export class BankAccountModule {}
