import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class CpayRole extends Model<CpayRole> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
  })
  title: string;

  @Column({
    type: DataType.BOOLEAN,
  })
  active: boolean;
}
