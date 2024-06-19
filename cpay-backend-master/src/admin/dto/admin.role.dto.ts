import { PaginationDto } from '@app/lib/dto/pagination.dto';

export class AddAdminRoleDto {
  title: string;
}

export class AdminRoleFilterDto extends PaginationDto {
  title: string;
  status: boolean;
  roleId: string;
}
