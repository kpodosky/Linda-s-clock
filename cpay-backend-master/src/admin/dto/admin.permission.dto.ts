import { PaginationDto } from '@app/lib/dto/pagination.dto';

export class AddAdminPermissionDto {
  title: string;
}

export class AdminPermissionFilterDto extends PaginationDto {
  permissionId: string;
  title: string;
  status: boolean;
}
