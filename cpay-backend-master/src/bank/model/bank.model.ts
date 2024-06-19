import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { CpayBusiness } from 'src/business/model/cpay.business.model';
import { FiatWalletCurrencyEnum } from 'src/wallet/enum/wallet.enum';
import { BankMeta, BankMetaMetaDefault } from '../dto/bank.dto';

@Table
export class Bank extends Model<Bank> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column
  accountName: string;

  @Column
  accountNumber: string;

  @Column({
    type: DataType.STRING,
  })
  bankCode: string;

  @Column({
    type: DataType.STRING,
  })
  bankName: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  active: boolean;

  @Column({
    type: DataType.ENUM(...Object.values(FiatWalletCurrencyEnum)),
  })
  currency: string;

  @ForeignKey(() => CpayBusiness)
  @Column
  businessId: string;

  @Column({
    type: DataType.JSONB,
    defaultValue: BankMetaMetaDefault,
  })
  meta: BankMeta;
}
