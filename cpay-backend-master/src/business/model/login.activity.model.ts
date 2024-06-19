import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { CpayUser } from './cpay.user.model';

@Table
export class LoginActivity extends Model<LoginActivity> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => CpayUser)
  @Column({
    type: DataType.UUID,
  })
  userId: string;

  @BelongsTo(() => CpayUser, { foreignKey: 'userId', as: 'user' })
  user: CpayUser;

  @Column
  os: string | null;

  @Column
  ip: string | null;

  @Column
  version: string | null;

  @Column
  userAgent: string | null;

  @Column
  longitude: string | null;

  @Column
  latitude: string | null;
}
