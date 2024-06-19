import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { AdminAccountStatusEnum } from '../enum/admin.enum';
import { AdminRoles } from './admin.role';
import {
  PasswordUpdateSchema,
  PasswordUpdateSchemaDefault,
} from '@app/lib/schema/password.schema';

@Table
export class Admin extends Model<Admin> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column
  fullName: string;

  @Column
  email: string;

  @Column
  profilePicture: string;

  @ForeignKey(() => AdminRoles)
  @Column({
    type: DataType.UUID,
  })
  roleId: string;

  @BelongsTo(() => AdminRoles, {
    foreignKey: 'roleId',
    as: 'role',
  })
  role: AdminRoles;

  @Column
  invitedBy: string;

  @Column
  password: string;

  @Column
  lastToken: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  twoFactorAuthentication: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  validFactorAuth: boolean;

  @Column({
    type: DataType.JSONB,
    defaultValue: PasswordUpdateSchemaDefault,
  })
  passwordChange: PasswordUpdateSchema;

  @Column({
    type: DataType.ENUM(...Object.values(AdminAccountStatusEnum)),
    defaultValue: AdminAccountStatusEnum.Pending,
  })
  status: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  deletedAt: Date | null;
}
