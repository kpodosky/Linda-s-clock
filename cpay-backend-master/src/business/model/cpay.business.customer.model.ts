import {
    BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { AccountVerificationSchema } from '../schema/customer.schema';
import { AccountVerificationDefault } from '../dto/cpay.user.dto';
import { CpayBusiness } from './cpay.business.model';
import { PhoneNumberSchema } from '@app/lib/dto/phone.dto';

@Table
export class CpayBusinessCustomer extends Model<CpayBusinessCustomer> {
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
    type: DataType.JSONB,
  })
  phoneNumber: PhoneNumberSchema;

  @Column({
    type: DataTypes.JSONB,
    defaultValue: AccountVerificationDefault,
  })
  verification: AccountVerificationSchema;

  @ForeignKey(() => CpayBusiness)
  @Column
  businessId: string;

  @BelongsTo(() => CpayBusiness, {
    foreignKey: 'businessId',
    as: 'business',
  })
  business: CpayBusiness;
}
