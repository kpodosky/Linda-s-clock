import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { CpayBusiness } from './cpay.business.model';
import { CpayRole } from './cpay.role.model';
import { CpayUser } from './cpay.user.model';

@Table
export class CpayUserRole extends Model<CpayUserRole> {
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

  @ForeignKey(() => CpayUser)
  @Column({
    type: DataType.UUID,
  })
  userId: string;

  @BelongsTo(() => CpayUser, { foreignKey: 'userId', as: 'user' })
  user: CpayUser;

  @ForeignKey(() => CpayRole)
  @Column({
    type: DataType.UUID,
  })
  roleId: string;

  @BelongsTo(() => CpayRole, { foreignKey: 'roleId', as: 'role' })
  role: CpayRole;
}
