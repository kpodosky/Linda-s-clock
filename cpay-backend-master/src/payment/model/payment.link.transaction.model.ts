import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { WalletCurrencyEnum } from 'src/wallet/enum/wallet.enum';
// import { Businesses } from 'src/business/model/business.model';
import { DataTypes } from 'sequelize';
import { CpayBusiness } from 'src/business/model/cpay.business.model';
import { PaymentLink } from 'src/payment/model/payment.link.model';
import { TransactionStatusEnum } from 'src/transaction/enums/transaction.enum';
import { CpayBusinessCustomer } from 'src/business/model/cpay.business.customer.model';
import { Transaction } from 'src/transaction/model/transaction.model';
import { PaymentLinkTransactionMetaData } from '../dto/payment.link.dto';

@Table
export class PaymentLinkTransaction extends Model<PaymentLinkTransaction> {
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
    type: DataTypes.DECIMAL(20, 3),
    allowNull: true,
  })
  amount: number;

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
    type: DataType.STRING,
  })
  description: string;

  @Column({
    type: DataType.STRING,
  })
  address: string;

  @ForeignKey(() => CpayBusinessCustomer)
  @Column
  senderId: string;

  @BelongsTo(() => CpayBusinessCustomer, {
    foreignKey: 'senderId',
    as: 'sender',
  })
  sender: CpayBusinessCustomer;

  @ForeignKey(() => Transaction)
  @Column
  transactionId: string;

  @BelongsTo(() => Transaction, {
    foreignKey: 'transactionId',
    as: 'transaction',
  })
  transaction: Transaction;

  @Column({
    type: DataType.STRING,
  })
  reference: string;

  @Column({
    type: DataTypes.DECIMAL(20, 3),
    defaultValue: 0,
  })
  currentBalance: number;

  @Column({
    type: DataTypes.DECIMAL(20, 3),
    defaultValue: 0,
  })
  @Column
  previousBalance: number;

  @Column({
    type: DataTypes.DECIMAL(20, 3),
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

  @Column({
    type: DataTypes.JSONB,
    allowNull: true,
  })
  meta: PaymentLinkTransactionMetaData;

}
