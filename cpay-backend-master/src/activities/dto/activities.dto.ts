import { PaginationDto } from '@app/lib/dto/pagination.dto';

export class CreateActivityDto {
  memberId: string;
  businessId: string;
  action: string;
  description: string;
  ip: string;
}

export class UpdateActivityDto {
  activityId: string;
}

export class FilterActivityDto extends PaginationDto {
  memberId: string;
  businessId: string;
  action: string;
  ip: string;
}
