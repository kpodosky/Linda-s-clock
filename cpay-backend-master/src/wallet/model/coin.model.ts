import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { CoinNetwork } from './coin.network.model';

@Table
export class Coin extends Model<Coin> {
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
  })
  code: string;

  @Column({
    type: DataType.STRING,
  })
  image: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  active: boolean;

  @HasMany(() => CoinNetwork)
  networks: CoinNetwork[];
}
