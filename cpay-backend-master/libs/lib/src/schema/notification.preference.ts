import { DataTypes } from 'sequelize';

export const NotificationPrefenceSchema = {
  email: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  pushNotification: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  sms: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
};
