import { PaginationDto } from '@app/lib/dto/pagination.dto';

export class CreateAdminActivityDto {
  adminId: string;
  action: string;
  description: string;
  ip: string;
}

export class AdminFilterActivityDto extends PaginationDto {
  adminId: string;
  action: string;
  ip: string;
}
