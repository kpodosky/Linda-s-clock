import { PaginationDto } from '@app/lib/dto/pagination.dto';
import { NetworkTagEnum } from '../enum/coin.enum';

export class CreateCoinNetworkDto {
  name: string;
  code: string;
  tag: NetworkTagEnum;
  coinId: string;
  contractAddress: string;
}

export class UpdateCoinNetworkDto {
  networkId: string;
  coinId: string;
  name: string;
  code: string;
  tag: NetworkTagEnum;
  contractAddress: string;
}

export class CoinNetworkFilterDto extends PaginationDto {
  networkId: string;
  coinId: string;
  name: string;
  code: string;
  image: string;
}
