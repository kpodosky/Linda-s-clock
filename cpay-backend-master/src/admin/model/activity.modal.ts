import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Admin } from './admin.model';

@Table
export class AdminActivity extends Model<AdminActivity> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Admin)
  @Column
  adminId: string;

  @BelongsTo(() => Admin, {
    foreignKey: 'adminId',
    as: 'admin',
  })
  admin: Admin;

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

}
