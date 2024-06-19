import { PaginationDto } from '@app/lib/dto/pagination.dto';

export class CreateCoinDto {
  name: string;
  code: string;
  image: string;
}

export class UpdateCoinDto {
  coinId: string;
  name: string;
  code: string;
  image: string;
}

export class CoinFilterDto extends PaginationDto {
  coinId: string;
  name: string;
  code: string;
  image: string;
}

export class CoinResponseDto {
  id: string;
  walletId: string;
}
