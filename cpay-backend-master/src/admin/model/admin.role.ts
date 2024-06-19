import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class AdminRoles extends Model<AdminRoles> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column
  title: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  active: boolean;
}
