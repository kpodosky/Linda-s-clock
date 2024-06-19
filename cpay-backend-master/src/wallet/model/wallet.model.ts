import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import {
  WalletCategoryEnum,
  WalletCurrencyEnum,
  WalletStatusEnum,
} from '../enum/wallet.enum';
import { CpayBusiness } from 'src/business/model/cpay.business.model';
import { WalletNetwork } from './wallet.coin.network.model';
import { Coin } from './coin.model';

@Table
export class Wallet extends Model<Wallet> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
  })
  currency: string;

  @Column({
    type: DataType.STRING,
  })
  name: string;

  @Column({
    type: DataType.ENUM(...Object.values(WalletCategoryEnum)),
  })
  category: string;

  @ForeignKey(() => CpayBusiness)
  @Column
  businessId: string;

  @BelongsTo(() => CpayBusiness, {
    foreignKey: 'businessId',
    as: 'business',
  })
  business: CpayBusiness;

  @ForeignKey(() => Coin)
  @Column
  coinId: string;

  @BelongsTo(() => CpayBusiness, {
    foreignKey: 'coinId',
    as: 'coin',
  })
  coin: Coin;

  // NOTE: Withdrawal should always happen based on availableBalance
  @Column({
    type: DataType.DOUBLE,
    allowNull: true,
    defaultValue: 0,
  })
  availableBalance: number;

  @Column({
    type: DataType.DOUBLE,
    allowNull: true,
    defaultValue: 0,
  })
  ledgerBalance: number;

  @Column({
    type: DataType.STRING,
    defaultValue: WalletStatusEnum.active,
  })
  status: WalletStatusEnum;

  @HasMany(() => WalletNetwork)
  networks: WalletNetwork[];

  @Column({
    type: DataType.STRING,
  })
  icon: string;

}
