import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Coin } from './coin.model';
import { CpayBusiness } from 'src/business/model/cpay.business.model';
import { Wallet } from './wallet.model';
import { CoinNetwork } from './coin.network.model';

@Table
export class WalletNetwork extends Model<WalletNetwork> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Wallet)
  @Column
  walletId: string;

  @BelongsTo(() => Wallet, {
    foreignKey: 'walletId',
    as: 'wallet',
  })
  wallet: Wallet;

  @ForeignKey(() => Coin)
  @Column
  coinId: string;

  @BelongsTo(() => Coin, {
    foreignKey: 'coinId',
    as: 'coin',
  })
  coin: Coin;

  @ForeignKey(() => CoinNetwork)
  @Column
  networkId: string;

  @BelongsTo(() => CoinNetwork, {
    foreignKey: 'networkId',
    as: 'network',
  })
  network: CoinNetwork;

  @ForeignKey(() => CpayBusiness)
  @Column
  businessId: string;

  @BelongsTo(() => CpayBusiness, {
    foreignKey: 'businessId',
    as: 'business',
  })
  business: CpayBusiness;

  @Column({
    type: DataType.STRING,
  })
  address: string;

  @Column({
    type: DataType.STRING,
  })
  scanCode: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  active: boolean;
}
