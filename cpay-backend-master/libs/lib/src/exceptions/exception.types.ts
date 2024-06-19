export interface ErrorResponse {
  status: number;
  name?: string;
  message?: string;
  data?: any;
  stack?: any;
  meta?: any;
}
