import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { CpayBusiness } from 'src/business/model/cpay.business.model';
import { FiatWalletCurrencyEnum } from 'src/wallet/enum/wallet.enum';
import { TransactionCategoryEnum, WithdrawalRequestsEnum } from '../../transaction/enums/transaction.enum';
import {
  WithdrawalRequestMeta,
  WithdrawalRequestMetaDefaults,
} from '../dto/withdrawal.request.dto';

@Table
export class WithdrawalRequests extends Model<WithdrawalRequests> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => CpayBusiness)
  @Column
  businessId: string;

  @BelongsTo(() => CpayBusiness, {
    foreignKey: 'businessId',
    as: 'business',
  })
  business: CpayBusiness;

  @Column({
    type: DataType.DOUBLE,
  })
  amount: number;

  @Column({
    type: DataType.ENUM(...Object.values(TransactionCategoryEnum)),
  })
  category: string;

  @Column({
    type: DataType.ENUM(...Object.values(WithdrawalRequestsEnum)),
  })
  status: string;

  @Column({
    type: DataType.ENUM(...Object.values(FiatWalletCurrencyEnum)),
  })
  currency: string;

  @Column
  bankCode: string;

  @Column
  accountNumber: string;

  @Column
  bank: string;

  @Column
  reference: string;

  @Column
  approvedBy: string;

  @Column
  name: string;

  @Column({
    type: DataType.JSONB,
    defaultValue: WithdrawalRequestMetaDefaults,
  })
  meta: WithdrawalRequestMeta;
}
