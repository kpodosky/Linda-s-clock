import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { WaitlistCategory } from '../enum/waitlist.enum';

@Table
export class WaitList extends Model<WaitList> {
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
  company: string;

  @Column(DataType.STRING)
  type: WaitlistCategory;
}
