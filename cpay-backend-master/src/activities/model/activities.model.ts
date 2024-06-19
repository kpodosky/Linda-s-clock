import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { CpayBusiness } from 'src/business/model/cpay.business.model';
import { CpayUser } from 'src/business/model/cpay.user.model';

@Table
export class Activity extends Model<Activity> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => CpayUser)
  @Column
  memberId: string;

  @BelongsTo(() => CpayUser, {
    foreignKey: 'memberId',
    as: 'member',
  })
  member: CpayUser;

  @ForeignKey(() => CpayBusiness)
  @Column
  businessId: string;

  @BelongsTo(() => CpayBusiness, {
    foreignKey: 'businessId',
    as: 'business',
  })
  business: CpayBusiness;

  @Column({
    type: DataType.STRING,
  })
  action: string;

  @Column({
    type: DataType.STRING,
  })
  description: string;

  @Column({
    type: DataType.STRING,
  })
  ip: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  read: boolean;
}
