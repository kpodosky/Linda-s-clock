import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { AccountVerificationSchema } from '../schema/customer.schema';
import { AccountVerificationDefault } from '../dto/cpay.user.dto';
import {
  PasswordUpdateSchema,
  PasswordUpdateSchemaDefault,
} from '@app/lib/schema/password.schema';
import { CpayBusiness } from './cpay.business.model';
import { CpayUserRole } from './cpay.user.role.model';

@Table
export class CpayUserInvitation extends Model<CpayUserInvitation> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
  })
  firstName: string;

  @Column({
    type: DataType.STRING,
  })
  lastName: string;

  @Column({
    type: DataType.STRING,
  })
  email: string;

  @Column({
    type: DataType.STRING,
  })
  password: string;

  @Column({
    type: DataType.STRING,
  })
  profilePicture: string;

  @Column({
    type: DataTypes.JSONB,
    defaultValue: AccountVerificationDefault,
  })
  verification: AccountVerificationSchema;

  @Column({
    type: DataTypes.JSONB,
    defaultValue: PasswordUpdateSchemaDefault,
  })
  passwordChange: PasswordUpdateSchema;

  @BelongsToMany(() => CpayBusiness, () => CpayUserRole)
  businesses: CpayBusiness[];
}
