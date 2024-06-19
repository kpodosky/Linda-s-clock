export enum TransactionTypeEnum {
  Credit = 'credit',
  Debit = 'debit',
}

export enum TransactionCategoryEnum {
  Crypto = 'crypto',
  Fiat = 'fiat',
}

export enum TransactionStatusEnum {
  Pending = 'pending',
  Abandoned = 'abandoned',
  Success = 'success',
  Failed = 'failed',
}

export enum TransactionCoinEnum {
  USDT = 'usdt',
  USDC = 'usdc',
}

export enum NetworkCode {
  Optimism = '10',
  Bnb = '56',
  Polygon = '137',
  Tron = '10121',
}

export enum WithdrawalRequestsEnum {
  'pending' = 'pending',
  'declined' = 'declined',
  'approved' = 'approved',
}
