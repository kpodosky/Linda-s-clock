import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class Rate extends Model<Rate> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
  })
  to: string;

  @Column({
    type: DataType.STRING,
  })
  from: string;

  @Column({
    type: DataType.DOUBLE,
    defaultValue: 0,
  })
  price: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  active: boolean;
}
