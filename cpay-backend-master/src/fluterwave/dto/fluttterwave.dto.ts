import { PaginationDto } from '@app/lib/dto/pagination.dto';

export interface paymentLinkDto {
  reference: string;
  amount: number;
  currency: string;
  redirectUrl: string;
  customerId: string;
  email: string;
  customerName: string;
}

export interface chargeCardDto {
  reference: string;
  amount: number;
  currency: string;
  redirectUrl: string;
  customerId: string;
  email: string;
  cardNumber: string;
  cvv: string;
  expiryMonth: string;
  expiryYear: string;
  category: string;
  customerName: string;
}
