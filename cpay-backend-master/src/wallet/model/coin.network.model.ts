import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Coin } from './coin.model';
import { NetworkTagEnum } from '../enum/coin.enum';

@Table
export class CoinNetwork extends Model<CoinNetwork> {
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
    type: DataType.ENUM(...Object.values(NetworkTagEnum)),
  })
  tag: string;

  @Column({
    type: DataType.STRING,
  })
  code: string;

  @ForeignKey(() => Coin)
  @Column
  coinId: string;

  @BelongsTo(() => Coin, {
    foreignKey: 'coinId',
    as: 'coin',
  })
  coin: Coin;

  @Column({
    type: DataType.STRING,
  })
  image: string;

  @Column({
    type: DataType.STRING,
  })
  contractAddress: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  active: boolean;
}
