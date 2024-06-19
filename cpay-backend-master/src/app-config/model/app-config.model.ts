import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class AppConfiguration extends Model<AppConfiguration> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.DOUBLE,
    defaultValue: 0,
  })
  depositChargesInPercent: number;

  @Column({
    type: DataType.DOUBLE,
    defaultValue: 0,
  })
  withdrawalCharges: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isDepositAvailable: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isWithdrawalAvailable: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isLoginAvailable: boolean;

  @Column({
    defaultValue: 'clockpay',
  })
  source: string;
}
