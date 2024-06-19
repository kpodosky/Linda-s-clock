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
export class CpayBusinessLocation extends Model<CpayBusinessLocation> {
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
  houseNo: string;

  @Column({
    type: DataType.STRING,
  })
  address: string;

  @Column({
    type: DataType.STRING,
  })
  city: string;

  @Column({
    type: DataType.STRING,
  })
  state: string;

  @Column({
    type: DataType.STRING,
  })
  country: string;
}
