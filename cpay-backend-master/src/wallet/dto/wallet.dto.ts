import { PaginationDto } from '@app/lib/dto/pagination.dto';
import {
  FiatWalletCurrencyEnum,
  PaymentChannelEnum,
  WalletCategoryEnum,
  WalletCurrencyEnum,
  WalletStatusEnum,
} from '../enum/wallet.enum';
import { NetworkTagEnum } from '../enum/coin.enum';
import { WithdrawalRequestsEnum } from 'src/transaction/enums/transaction.enum';

export class WalletCreationDto {
  id?: string;
  name: string;
  businessId: string;
  currency?: WalletCurrencyEnum;
  status?: WalletStatusEnum;
  legacyAddress?: string;
  address?: string;
  asset?: string;
  icon: string;
  category: WalletCategoryEnum;
}

export class WalletSearchValidatorDto extends PaginationDto {
  businessId: string[];
  walletStatus: string[];
  currency: string[];
}

export class BusinessWalletSearchValidatorDto extends PaginationDto {
  businessId: string;
  currency: FiatWalletCurrencyEnum;
  category: WalletCategoryEnum;
  status: WalletStatusEnum;
}

export class WalletTransactionDto {
  amount: number;
  channel: PaymentChannelEnum;
  currency: WalletCurrencyEnum;
  businessId: string;
  description: string;
  cardDetails: {
    cardNumber: string;
    cvv: string;
    expiryMonth: string;
    expiryYear: string;
  };
}

export class EnableAndDisableWalletDto {
  status: boolean;
  currency: WalletCurrencyEnum;
}

export class AddCryptoWalletDto {
  assetId: string;
  vaultId: string;
  name: string;
}

export class WalletAddressValidatorDto {
  assetId: string;
  address: string;
}

export class AdminCoinNetworkCreationDto {
  id?: string;
  name: string;
  networkIcon: string;
  address: string;
  scanCode: string;
  code: string;
}
export class AdminCoinNetworkAddDto {
  networkId: string;
  address: string;
  walletNetworkId?: string;
}

export class AdminWalletCreationDto {
  id?: string;
  businessId: string;
  currency?: WalletCurrencyEnum;
  category: WalletCategoryEnum;
  icon: string;
  coinId: string;
  name: string;
  networks: AdminCoinNetworkCreationDto[];
}

export class AdminWalletAddDto {
  id?: string;
  businessId: string;
  currency?: WalletCurrencyEnum;
  category: WalletCategoryEnum;
  icon: string;
  coinId: string;
  name: string;
  networks: AdminCoinNetworkAddDto[];
}

export class AdminWalletAddCallDto {
  businessId: string;
  tag: NetworkTagEnum;
  address: string;
  coinId: string;
}

// export class AdminWalletUpdateDto {
//   wall: string;
//   businessId: string;
//   currency?: WalletCurrencyEnum;
//   category: WalletCategoryEnum;
//   icon: string;
//   coinId: string;
//   name: string;
//   networks: AdminCoinNetworkAddDto[];
// }

export class WalletWithdrawalValidatorDto {
  businessId: string;
  walletId: string;
  bankId: string;
  amount: number;
  currency: FiatWalletCurrencyEnum;
}

export class AdminWalletUpdateDto {
  walletId: string;
  address: string;
  tag: NetworkTagEnum;
}

export class SetAcceptedCurrencyDto {
  walletId: string;
}
