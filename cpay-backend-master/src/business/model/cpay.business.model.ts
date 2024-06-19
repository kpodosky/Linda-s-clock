import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import {
  BusinessAccountVerificationDefault,
  BussinessAccountStatus,
  verificationLevel,
} from '../dto/cpay.user.dto';
import {
  BusinessAccountPercentageCompletion,
  BusinessAccountPercentageCompletionDefault,
  BusinessAccountVerificationSchema,
} from '../schema/customer.schema';
import { CpayBusinessConfiguration } from './cpay.business.configuration.model';
import { CpayBusinessProfile } from './cpay.business.profile.model';
import { CpayUser } from './cpay.user.model';
import { BusinessAccountModeEnum } from '../enum/business.enum';
import { Wallet } from 'src/wallet/model/wallet.model';
import { CpayBusinessCustomer } from './cpay.business.customer.model';
import { CpayBusinessLocation } from './cpay.business.location.model';

@Table
export class CpayBusiness extends Model<CpayBusiness> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: true,
  })
  accountId: string;

  @Column({
    type: DataType.STRING,
  })
  industry: string;

  @Column({
    type: DataTypes.STRING,
    defaultValue: verificationLevel.level0,
  })
  level: string;

  @Column({
    type: DataTypes.STRING,
    defaultValue: BussinessAccountStatus.InActive,
  })
  businessStatus: string;

  @Column({
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  })
  confirmStatus: boolean;

  @Column({
    type: DataTypes.JSONB,
    defaultValue: BusinessAccountVerificationDefault,
  })
  verification: BusinessAccountVerificationSchema;

  @Column({
    type: DataTypes.JSONB,
    defaultValue: BusinessAccountPercentageCompletionDefault,
  })
  percentage: BusinessAccountPercentageCompletion;

  @HasOne(() => CpayBusinessConfiguration)
  configuration: CpayBusinessConfiguration;

  @HasOne(() => CpayBusinessProfile)
  profile: CpayBusinessProfile;

  @HasOne(() => CpayBusinessLocation)
  location: CpayBusinessLocation;

  @BelongsToMany(() => CpayUser, {
    through: 'businessUser',
    foreignKey: 'businessId',
    otherKey: 'userId',
  })
  users: CpayUser[];

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

  @Column({
    type: DataTypes.ENUM(...Object.values(BusinessAccountModeEnum)),
    defaultValue: BusinessAccountModeEnum.sandbox,
  })
  mode: string;

  @HasMany(() => Wallet)
  wallets: Wallet[];

  @HasMany(() => CpayBusinessCustomer)
  customers: CpayBusinessCustomer[];
}
