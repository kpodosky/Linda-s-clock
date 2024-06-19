import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  BelongsTo,
} from 'sequelize-typescript';
import { CpayBusiness } from './cpay.business.model';
import { PhoneNumberSchema } from '@app/lib/dto/phone.dto';

@Table
export class CpayBusinessProfile extends Model<CpayBusinessProfile> {
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
  businessLogo: string;

  @Column({
    type: DataType.STRING,
  })
  businessCertificateImage: string;

  @Column({
    type: DataType.STRING,
  })
  businessRegistrationDocument: string;

  @Column({
    type: DataType.STRING,
  })
  registrationNumber: string;

  @Column({
    type: DataType.STRING,
  })
  email: string;

  @Column({
    type: DataType.STRING,
  })
  website: string;

  @Column({
    type: DataType.JSONB,
  })
  phoneNumber: PhoneNumberSchema;

  @Column({
    type: DataType.STRING,
  })
  size: string;

  @Column({
    type: DataType.STRING,
  })
  description: string;

}
