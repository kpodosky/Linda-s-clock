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
export class LoginDevice extends Model<LoginDevice> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
  })
  userAgent: string;

  @Column({
    type: DataType.STRING,
  })
  os: string | null;

  @Column({
    type: DataType.STRING,
  })
  versionId: string | null;

  @ForeignKey(() => CpayUser)
  @Column({
    type: DataType.UUID,
  })
  ownerId: string;

  @BelongsTo(() => CpayUser, {
    foreignKey: 'ownerId',
    as: 'owner',
  })
  owner: CpayUser;
}
