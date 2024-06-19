import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  BelongsTo,
} from 'sequelize-typescript';
import { CpayBusiness } from './cpay.business.model';

@Table
export class CpayBusinessConfiguration extends Model<CpayBusinessConfiguration> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => CpayBusiness)
  @Column({
    type: DataType.UUID,
  })
  businessId: string;

  @BelongsTo(() => CpayBusiness, { foreignKey: 'businessId', as: 'business' })
  business: CpayBusiness;

  @Column({
    type: DataType.STRING,
  })
  liveApiKey: string;

  @Column({
    type: DataType.STRING,
  })
  liveApiSecret: string;

  @Column({
    type: DataType.STRING,
  })
  sandBoxApiKey: string;

  @Column({
    type: DataType.STRING,
  })
  sandBoxApiSecret: string;

  @Column({
    type: DataType.BIGINT,
    defaultValue: 0,
  })
  overPaymentAmount: number;

  @Column({
    type: DataType.DOUBLE,
    defaultValue: 0,
  })
  overPaymentRelative: number;

  @Column({
    type: DataType.BIGINT,
    defaultValue: 0,
  })
  underPaymentAmount: number;

  @Column({
    type: DataType.DOUBLE,
    defaultValue: 0,
  })
  underPaymentRelative: number;

}
