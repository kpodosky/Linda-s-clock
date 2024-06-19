import { PaginationDto } from '@app/lib/dto/pagination.dto';

export class CreateAppConfigDto {
  depositChargesInPercent: number;
  withdrawalCharges: number;
  isDepositAvailable: boolean;
  isWithdrawalAvailable: boolean;
  isLoginAvailable: boolean;
}

export class UpdateAppConfig {
  configId: string;
  source: string;
  depositChargesInPercent: number;
  withdrawalCharges: number;
  isDepositAvailable: number;
  isWithdrawalAvailable: boolean;
  isLoginAvailable: boolean;
}

export class UpdateAppConfigPricesDto {
  key: string;
  value: number;
}

export class UpdateAppConfigTruthyDto {
  key: string;
  value: boolean;
}

export class FilterAppConfigDto extends PaginationDto {
  configId: string;
  source: string;
  depositChargesInPercent: number;
  withdrawalCharges: number;
  isDepositAvailable: number;
  isWithdrawalAvailable: boolean;
  isLoginAvailable: boolean;
}
