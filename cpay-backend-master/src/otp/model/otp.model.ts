import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { OtpTypeEnum } from '../enums/otp.enum';

@Table
export class Otp extends Model<Otp> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;
  @Column
  receiver: string;

  @Column
  code: string;

  @Column
  reference: string;

  @Column(DataType.STRING)
  type: OtpTypeEnum;

  @Column
  expirationDate: Date;
}
