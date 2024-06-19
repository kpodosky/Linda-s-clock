export class PasswordUpdateSchema {
  confirmChange: boolean;
  ready: boolean;
  lastUpdated: Date;
}

export const PasswordUpdateSchemaDefault: PasswordUpdateSchema = {
  confirmChange: true,
  ready: false,
  lastUpdated: new Date(),
};

export const passwordPattern =
  /^(?=.*\d)(?=.*[!@#$%^&*,?.])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
