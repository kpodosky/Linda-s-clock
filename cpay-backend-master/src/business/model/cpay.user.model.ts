import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import {
  AccountAuthenticationSchema,
  AccountVerificationSchema,
  UserAccountVerificationSchema,
  UserAccountVerificationSchemaDefault,
} from '../schema/customer.schema';
import {
  AccountAuthenticationDefault,
  AccountVerificationDefault,
  CustomerAccountStatus,
} from '../dto/cpay.user.dto';
import {
  PasswordUpdateSchema,
  PasswordUpdateSchemaDefault,
} from '@app/lib/schema/password.schema';
import { CpayBusiness } from './cpay.business.model';
import { CpayUserRole } from './cpay.user.role.model';
import { PhoneNumberSchema } from '@app/lib/dto/phone.dto';
import { SimpleAddressDto } from '../dto/cpay.business.dto';

@Table
export class CpayUser extends Model<CpayUser> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
  })
  firstName: string;

  @Column({
    type: DataType.STRING,
  })
  lastName: string;

  @Column({
    type: DataType.STRING,
  })
  email: string;

  @Column({
    type: DataType.STRING,
  })
  password: string;

  @Column({
    type: DataType.STRING,
  })
  profilePicture: string;

  @Column({
    type: DataType.STRING,
  })
  qrcode: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  authVerified: boolean;

  @Column({
    type: DataTypes.JSONB,
    allowNull: true,
  })
  phoneNumber: PhoneNumberSchema;

  @Column({
    type: DataTypes.JSONB,
    defaultValue: UserAccountVerificationSchemaDefault,
  })
  identity: UserAccountVerificationSchema;

  @Column({
    type: DataTypes.JSONB,
    defaultValue: AccountVerificationDefault,
  })
  verification: AccountVerificationSchema;

  @Column({
    type: DataTypes.JSONB,
    defaultValue: AccountAuthenticationDefault,
  })
  authentication: AccountAuthenticationSchema;

  @Column
  lastToken: string;

  @Column({
    type: DataTypes.JSONB,
  })
  address: SimpleAddressDto;

  @Column({
    type: DataTypes.JSONB,
    defaultValue: PasswordUpdateSchemaDefault,
  })
  passwordChange: PasswordUpdateSchema;

  @BelongsToMany(() => CpayBusiness, () => CpayUserRole)
  businesses: CpayBusiness[];

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  deletedAt: Date | null;

  public getPercentage(): object {
    const verificationTrueColumnsCount = [
      this.verification.emailVerified,
    ].filter((value) => value === true).length;

    const verificationEnumColumnsCount = [
      this.verification.kycVerification,
    ].filter((value) => value === CustomerAccountStatus.Approved).length;

    const nonNullColumnsCount = [
      this.firstName,
      this.lastName,
      this.email,
      this.phoneNumber,
      // this.profilePicture,
    ].filter((value) => value !== null).length;
    const totalColumnsCount = 6;

    let profilePercentage = 0;
    const businessDoc = [];
    const businessDetails = [];

    if (this.id) {
      profilePercentage =
        ((nonNullColumnsCount +
          verificationTrueColumnsCount +
          verificationEnumColumnsCount) /
          totalColumnsCount) *
        100;
    }
    if (this.businesses) {
      for (const business of this.businesses) {
        if (business.profile || business.location) {
          let documentValue = 0;
          let documentPercentage = 0;
          const profile = business.profile ? business.profile.toJSON() : null;
          const location = business.location
            ? business.location.toJSON()
            : null;
          if (profile || location) {
            const profileTrueColumns = [
              profile?.businessLogo ?? null,
              profile?.registrationNumber ?? null,
              location?.houseNo ?? null,
              location?.address ?? null,
              location?.city ?? null,
              location?.state ?? null,
              location?.country ?? null,
              profile?.website ?? null,
              profile?.phoneNumber ?? null,
              profile?.size ?? null,
              profile?.description ?? null,
            ];
            profileTrueColumns.forEach((value) => {
              if (value !== null) {
                documentValue++;
              }
            });
            const totalColumns = profileTrueColumns.length;
            documentPercentage = (documentValue / totalColumns) * 100;
          }

          businessDetails.push({
            businessId: business.id,
            percent: documentPercentage
              ? parseFloat(documentPercentage.toFixed(2))
              : 0,
          });
        } else {
          businessDetails.push({
            businessId: business.id,
            percent: 0,
          });
        }
      }
      for (const business of this.businesses) {
        if (business.profile) {
          let documentPercentage = 0;

          const profile = business.profile.toJSON();
          const totalColumns = [profile.businessRegistrationDocument].filter(
            (value) => value !== null,
          ).length;
          documentPercentage = (totalColumns / 1) * 100;

          businessDoc.push({
            businessId: business.id,
            percent: documentPercentage
              ? parseFloat(documentPercentage.toFixed(2))
              : 0,
          });
        } else {
          businessDoc.push({ businessId: business.id, percent: 0 });
        }
      }
    }

    return {
      profile: parseFloat(profilePercentage.toFixed(2)),
      businessDetails,
      businessDoc: businessDoc,
    };
  }
}
