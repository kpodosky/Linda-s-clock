import { PaginationDto } from '@app/lib/dto/pagination.dto';

export class CreateWalletCoinNetworkDto {
  walletId: string;
  businessId: string;
  coinId: string;
  address: string;
  scanCode: string;
  networkId: string;
}

export class UpdateWalletCoinNetworkDto {
  networkId: string;
  coinId: string;
  name: string;
  code: string;
  image: string;
  businessId: string;
  address: string;
  scanCode: string;
}

export class WalletCoinNetworkFilterDto extends PaginationDto {
  networkId: string;
  businessId: string;
  coinId: string;
  name: string;
  code: string;
  image: string;
}

export class WalletCoinNetworkResponseDto {
  id: string;
  walletId: string;
}
