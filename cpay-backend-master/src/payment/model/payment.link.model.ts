import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { CpayBusiness } from 'src/business/model/cpay.business.model';
import { PaymentLinkStatusEnum } from '../enum/payment.link.enum';
import { CpayUser } from 'src/business/model/cpay.user.model';
import { Coin } from 'src/wallet/model/coin.model';

@Table
export class PaymentLink extends Model<PaymentLink> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.DECIMAL,
  })
  amount: number;

  @Column({
    type: DataType.STRING,
  })
  currency: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  variableAmount: boolean;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentLinkStatusEnum)),
    defaultValue: PaymentLinkStatusEnum.enabled,
  })
  status: string;

  @Column({
    type: DataType.STRING,
  })
  url: string;

  @Column({
    type: DataType.STRING,
  })
  title: string;

  @Column({
    type: DataType.STRING,
  })
  redirectUrl: string;

  @Column({
    type: DataType.STRING,
  })
  description: string;

  @Column({
    type: DataType.STRING,
  })
  banner: string;

  @ForeignKey(() => CpayUser)
  @Column({
    type: DataType.UUID,
  })
  creatorId: string;

  @BelongsTo(() => CpayUser, {
    foreignKey: 'creatorId',
    as: 'creator',
  })
  creator: CpayUser;

  @ForeignKey(() => CpayBusiness)
  @Column
  businessId: string;

  @BelongsTo(() => CpayBusiness, {
    foreignKey: 'businessId',
    as: 'business',
  })
  business: CpayBusiness;

  @ForeignKey(() => Coin)
  @Column
  coinId: string;

  @BelongsTo(() => Coin, {
    foreignKey: 'coinId',
    as: 'coin',
  })
  coin: Coin;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  deletedAt: Date | null;
}
