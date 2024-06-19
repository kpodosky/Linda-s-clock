import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import {
  TransactionCategoryEnum,
  TransactionStatusEnum,
  TransactionTypeEnum,
} from '../enums/transaction.enum';
import { WalletCurrencyEnum } from 'src/wallet/enum/wallet.enum';
// import { Businesses } from 'src/business/model/business.model';
import { DataTypes } from 'sequelize';
import { CpayBusiness } from 'src/business/model/cpay.business.model';
import { PaymentLink } from 'src/payment/model/payment.link.model';
import { Wallet } from 'src/wallet/model/wallet.model';

@Table
export class Transaction extends Model<Transaction> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => CpayBusiness)
  @Column
  businessId: string;

  @BelongsTo(() => CpayBusiness, {
    foreignKey: 'businessId',
    as: 'business',
  })
  business: CpayBusiness;

  @Column({
    type: DataTypes.DOUBLE(20, 3),
  })
  amount: number;

  @Column({
    type: DataTypes.DOUBLE(20, 3),
  })
  rateInUsd: number;

  @Column({
    type: DataTypes.DECIMAL(20, 3),
    allowNull: true,
  })
  cryptoValue: number;

  @Column({
    type: DataType.ENUM(...Object.values(TransactionTypeEnum)),
    allowNull: false,
  })
  type: string;

  @Column({
    type: DataType.ENUM(...Object.values(TransactionStatusEnum)),
    defaultValue: TransactionStatusEnum.Pending,
  })
  status: string;

  @Column({
    type: DataType.ENUM(...Object.values(WalletCurrencyEnum)),
  })
  currency: string;

  @Column({
    type: DataType.ENUM(...Object.values(TransactionCategoryEnum)),
  })
  category: string;

  @Column({
    type: DataType.STRING,
  })
  description: string;

  @Column({
    type: DataType.STRING,
  })
  sender: string;

  @Column({
    type: DataType.STRING,
  })
  receipient: string;

  @Column({
    type: DataType.STRING,
  })
  reference: string;

  @Column({
    type: DataType.STRING,
  })
  providerReference: string;

  @Column({
    type: DataType.JSONB,
  })
  meta: object;

  @Column({
    type: DataType.DOUBLE,
    defaultValue: 0,
  })
  currentBalance: number;

  @Column({
    type: DataType.DOUBLE,
    defaultValue: 0,
  })
  @Column
  previousBalance: number;

  @Column({
    type: DataType.DOUBLE,
    defaultValue: 0,
  })
  @Column
  charges: number;

  @ForeignKey(() => PaymentLink)
  @Column
  paymentLinkId: string;

  @BelongsTo(() => PaymentLink, {
    foreignKey: 'paymentLinkId',
    as: 'paymentLink',
  })
  paymentLink: PaymentLink;

  @ForeignKey(() => Wallet)
  @Column
  walletId: string;

  @BelongsTo(() => Wallet, {
    foreignKey: 'walletId',
    as: 'wallet',
  })
  wallet: Wallet;
}
