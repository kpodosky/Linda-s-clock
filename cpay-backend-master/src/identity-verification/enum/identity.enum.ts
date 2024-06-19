import { Logger } from '@nestjs/common';

export enum IdentityTypeEnum {
  passport = 'PP',
  driverLicense = 'DL',
  governmentId = 'ID',
}

export const CountryExtraction = (dialCode) => {
  let code;
  switch (dialCode) {
    case '+234':
      code = 'NGA';
      break;
    case '+1':
      code = 'USA';
      break;
    case '+44':
      code = 'GBR';
    // case '+44':
    //   code = 'CAN';
      break;
    default:
      Logger.debug('Invalid code');
      break;
  }
  return code;
};
