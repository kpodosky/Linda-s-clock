export interface CoordinateSchema {
  type: string;
  coordinates: number[];
}

export interface AddressSchema extends CoordinateSchema {
  address: string;
  country: string;
  city: string;
  state: string;
}
