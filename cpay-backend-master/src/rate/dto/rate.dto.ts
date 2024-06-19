import { PaginationDto } from '@app/lib/dto/pagination.dto';

export class RateCreateDto {
  id?: string;
  to: string;
  from: string;
  price: number;
}

export class RateUpdateDto {
  rateId: string;
  to: string;
  from: string;
  price: number;
}

export class RateFilterDto extends PaginationDto {
  active: boolean;
}
