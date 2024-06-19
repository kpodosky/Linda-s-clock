export class AddressDto {
  country: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  coordinates: [number, number];
}
