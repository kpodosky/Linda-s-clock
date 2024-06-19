import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { ObjectValidationPipe } from '@app/lib/pipe/validation.pipe';
import { BusinessTokenDecorator } from '@app/lib/token/decorator/token.decorator';
import {
  BusinessTokenDto,
  RequiredKYBGuard,
  RequiredKYCGuard,
} from '@app/lib/token/dto/token.dto';
import { CpayUserService } from 'src/business/service/cpay.user.service';
import { CypayUserRoleService } from 'src/business/service/cpay.user.role.service';
import { CpayRoleService } from 'src/business/service/cpay.role.service';
import { CpayBusinessService } from 'src/business/service/cpay.business.service';
import { CpayBusinessProfileService } from 'src/business/service/cpay.business.profile.service';
import { CpayBusinessConfigurationService } from 'src/business/service/cpay.business.configuration.service';
import {
  BusinessInformationUpdateDto,
  BusinessLocationUpdateDto,
  BusinessMemberFilterDto,
  BusinessProfileUpdateDto,
  BusinessStatusUpdateDto,
  BusinessUser2FAUpdateDto,
  PersonalAccountDeletionDto,
  PersonalInformationUpdateDto,
  createBusinesDto,
  removeAccessInviteDto,
  roleFilterDto,
  sendAccessInviteDto,
} from '../dto/cpay.business.dto';
import {
  BusinessMemberFilterValidator,
  BusinessRolesFilterValidator,
  OwnerInviteMemberValidator,
  OwnerRemoveMemberValidator,
  Update2FaValidator,
  UpdateBusinessInformationValidator,
  UpdateBusinessLocationValidator,
  UpdateBusinessProfileValidator,
  UpdateBusinessStatusValidator,
  UpdatePersonalInformationValidator,
  createCpayBusinessValidator,
  personalAccountDeletionValidator,
} from '../validator/cpay.business.validator';
import {
  CreateBusinessAccountGuard,
  PersonalProfileGuard,
} from '../guard/cpay.business.guard';
import { Op } from 'sequelize';
import { BusinessEventsEnum } from '../event/business.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WalletService } from 'src/wallet/service/wallet.service';
import {
  WalletCategoryEnum,
  WalletCurrencyEnum,
} from 'src/wallet/enum/wallet.enum';
import { BusinessAccountMemberRoleEnum } from '../enum/business.enum';
import { FileService, multerStorage } from 'src/file/service/file.service';
import { CpayBusinessLocationService } from '../service/cpay.business.location.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { filelocationEnum } from 'src/file/enum/file.enum';
import {
  AccountAuthenticationDefault,
  BussinessAccountStatus,
  CustomerKycVerificationDto,
  KYBVerificationDto,
} from '../dto/cpay.user.dto';
import { ActivityEvent } from 'src/activities/event/activity.event';
import { CsvService } from '@app/lib/function/cv.generator.service';
import { CpayUser } from '../model/cpay.user.model';
import { InjectModel } from '@nestjs/sequelize';
import { ProfileUpdatePipe } from '../pipe/business.pipe';
import { CountryEnum } from '@app/lib/enum/country.enum';
import { CountryExtraction } from 'src/identity-verification/enum/identity.enum';
import { PhoneNumberSchema } from '@app/lib/dto/phone.dto';
import { ConfigService } from '@nestjs/config';

@Controller('business')
export class BusinessController {
  constructor(
    private readonly cpayUserService: CpayUserService,
    private readonly cypayUserRoleService: CypayUserRoleService,
    private readonly cpayRoleService: CpayRoleService,
    private readonly cpayBusinessService: CpayBusinessService,
    private readonly cpayBusinessProfileService: CpayBusinessProfileService,
    private readonly cpayBusinessConfigurationService: CpayBusinessConfigurationService,
    private readonly eventEmitter: EventEmitter2,
    private readonly walletService: WalletService,
    private readonly fileService: FileService,
    private readonly cpayBusinessLocationService: CpayBusinessLocationService,
    private readonly csvService: CsvService,
    private readonly configService: ConfigService,
    @InjectModel(CpayUser)
    private readonly cpayUser: CpayUser,
  ) {}

  @Post('create')
  @UseGuards(CreateBusinessAccountGuard)
  async createBusiness(
    @Body(new ObjectValidationPipe(createCpayBusinessValidator))
    data: createBusinesDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    try {
      const ownerRole = await this.cpayRoleService.findOne({
        where: {
          title: {
            [Op.iLike]: BusinessAccountMemberRoleEnum.owner,
          },
        },
      });
      const accountOwner = await this.cpayUserService.findById(token.id);
      const business = this.cpayBusinessService.initialize({
        ...data,
        ownerId: token.id,
        accountId: this.cpayBusinessProfileService.generateId(),
      });
      const configuration = this.cpayBusinessConfigurationService.initialize({
        businessId: business.id,
      });
      const profile = this.cpayBusinessProfileService.initialize({
        businessId: business.id,
        email: data.email,
      });

      const role = this.cypayUserRoleService.initialize({
        userId: token.id,
        businessId: business.id,
        roleId: ownerRole.id,
      });
      const ngnWallet = this.walletService.initialize({
        name: 'Naira',
        businessId: business.id,
        currency: WalletCurrencyEnum.NGN.toLowerCase() as any,
        category: WalletCategoryEnum.fiat,
        icon: 'https://res.cloudinary.com/dlbjdsad5/image/upload/v1713775722/profileDocument/uibrnc90c2ibezmsgc2n.jpg',
      });
      const usdWallet = this.walletService.initialize({
        name: 'US Dollar',
        businessId: business.id,
        currency: WalletCurrencyEnum.USD.toLowerCase() as any,
        category: WalletCategoryEnum.fiat,
        icon: 'https://res.cloudinary.com/dlbjdsad5/image/upload/v1713775781/profileDocument/cg0cppqa92qqkcgx7ezq.png',
      });
      const location = this.cpayBusinessLocationService.initialize({
        businessId: business.id,
      });
      await Promise.all([
        business.save(),
        role.save(),
        ngnWallet.save(),
        usdWallet.save(),
        profile.save(),
        configuration.save(),
        location.save(),
      ]);
      const emailData = {
        username: `${accountOwner.firstName} ${accountOwner.lastName}`,
        email: token.email,
        subject: 'Successfully Created a New Business',
        businessName: data.name,
        businessEmail: data.email,
        accountOwner: `${accountOwner.firstName} ${accountOwner.lastName}`,
        data: await this.cpayBusinessLocationService.dayMonthYearDateFormatter(
          business.createdAt,
        ),
      };
      this.eventEmitter.emitAsync(
        BusinessEventsEnum.NEW_BUSINESS_ACCOUNT,
        emailData,
      );
      const logData = {
        memberId: token.id,
        businessId: business.id,
        action: 'Add New Business',
        description: 'Added business account',
        ip: token.ip,
      };
      this.eventEmitter.emitAsync(
        BusinessEventsEnum.BUSINESS_MEMBER_ACTIVITY,
        logData,
      );

      return {
        message: 'Business created successfully',
      };
    } catch (error) {
      console.log('error', error);
      throw new InternalServerErrorException(
        'Something went wrong, please try again',
        error.toString(),
      );
    }
  }

  @Post('send-email-verification-code')
  async resetEmailVerificationCode(
    // data: BusinessMemberForgotPasswordDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    return {
      message: 'Verification code sent to account email successfully',
    };
  }

  @Post('invite-member')
  @RequiredKYBGuard()
  // @RequiredKYCGuard()
  @UseGuards(CreateBusinessAccountGuard)
  async inviteMember(
    @Body(new ObjectValidationPipe(OwnerInviteMemberValidator))
    data: sendAccessInviteDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
    @Req() request: Request,
  ) {
    const business = await this.cpayBusinessService.findById(data.businessId);
    let memberAccountExists = await this.cpayUserService.findOne({
      where: {
        email: {
          [Op.iLike]: data.email,
        },
      },
    });
    if (!memberAccountExists) {
      memberAccountExists = this.cpayUserService.initialize({
        email: data.email,
      });
    }
    let role = await this.cypayUserRoleService.findOne({
      where: {
        userId: memberAccountExists.id,
        businessId: business.id,
      },
    });
    if (!role) {
      role = await this.cypayUserRoleService.initialize({
        userId: memberAccountExists.id,
        businessId: business.id,
        roleId: data.roleId,
      });
    }
    await Promise.all([memberAccountExists.save(), role.save()]);
    const emailData = {
      username: 'Member',
      email: data.email,
      subject: `Invitation to ${business.name} Business Account`,
      message: `You have been invited to ${business.name} business account, please click the link to continue`,
      link: `${this.configService.get('FRONTEND_URL')}`,
      preview: 'Invitation',
    };
    this.eventEmitter.emitAsync(
      BusinessEventsEnum.ACCOUNT_INVITE_MAIL,
      emailData,
    );
    const logData = {
      memberId: token.id,
      businessId: business.id,
      action: 'Invite',
      description: `Sent account invite to ${data.email}`,
      ip: token.ip,
    };
    this.eventEmitter.emitAsync(
      BusinessEventsEnum.BUSINESS_MEMBER_ACTIVITY,
      logData,
    );

    return {
      message: 'Invite sent successfully',
    };
  }

  @Post('remove-member')
  @RequiredKYBGuard()
  // @RequiredKYCGuard()
  async removeMember(
    @Body(new ObjectValidationPipe(OwnerRemoveMemberValidator))
    data: removeAccessInviteDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    const business = await this.cpayBusinessService.findById(data.businessId);
    if (data.userId === business.ownerId) {
      throw new BadRequestException(
        'Account owner cannot be removed from the business',
      );
    }
    const user = await this.cpayUserService.findById(data.userId);
    await this.cypayUserRoleService.deleteBy({
      userId: user.id,
      businessId: data.businessId,
    });

    const logData = {
      memberId: token.id,
      businessId: business.id,
      action: 'Invite',
      description: `Removed ${user.email} access from the business account`,
      ip: token.ip,
    };
    this.eventEmitter.emitAsync(
      BusinessEventsEnum.BUSINESS_MEMBER_ACTIVITY,
      logData,
    );

    return {
      message: 'Member removed successfully',
    };
  }

  @Get('members')
  async cpayBusinessMembers(
    @Query(new ObjectValidationPipe(BusinessMemberFilterValidator))
    query: BusinessMemberFilterDto,
    @BusinessTokenDecorator() token: BusinessTokenDto,
  ) {
    const logData = {
      memberId: token.id,
      businessId: query.businessId,
      action: 'Members',
      description: `Retrieved member details`,
      ip: token.ip,
    };
    this.eventEmitter.emitAsync(
      ActivityEvent.REGISTER_MEMBER_ACTIVITY,
      logData,
    );
    return await this.cypayUserRoleService.search(query);
  }

  @Get('roles')
  async cpayRoles(
    @Query(new ObjectValidationPipe(BusinessRolesFilterValidator))
    query: roleFilterDto,
  ) {
    return await this.cpayRoleService.search(query);
  }

  @Patch('profile-picture')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'profilePicture' }], {
      dest: './upload',
      storage: multerStorage,
    }),
  )
  async UpdateProfilePicture(
    @UploadedFiles()
    files: {
      profilePicture: Express.Multer.File;
    },
    @BusinessTokenDecorator()
    token: BusinessTokenDto,
  ) {
    if (files.profilePicture) {
      const file = await this.fileService.uploadDocument(
        files.profilePicture[0].filename,
        filelocationEnum.profileDocument,
      );

      await this.cpayUserService.findByIdAndUpdate(token.id, {
        profilePicture: file.secure_url,
      });
    }

    return {
      message: 'Profile picture updated successfully',
    };
  }

  @Patch('personal-information')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'image' }], {
      dest: './upload',
      storage: multerStorage,
    }),
  )
  async UpdatePersonalInformation(
    @Body(
      new ObjectValidationPipe(UpdatePersonalInformationValidator),
      ProfileUpdatePipe,
    )
    data: PersonalInformationUpdateDto,
    @UploadedFiles()
    files: {
      image: Express.Multer.File;
    },
    @BusinessTokenDecorator()
    token: BusinessTokenDto,
  ) {
    await this.cpayUserService.findByIdAndUpdate(token.id, {
      ...data,
      address: {
        ...data?.address,
      },
    });
    const user = await this.cpayUserService.findById(token.id);
    const hasIdNumber = data.idNumber ?? user.identity.idNumber;
    if (files.image && hasIdNumber) {
      const countryCode = data.address ? data.address.iso3 : user.address.iso3;
      const emailData: CustomerKycVerificationDto = {
        customerId: token.id,
        number: data.idNumber,
        image: files.image,
        countryCode,
        type: data.type,
      };

      this.eventEmitter.emitAsync(
        BusinessEventsEnum.KYC_VERIFICATION,
        emailData,
      );
    }

    return {
      message: 'Profile updated successfully',
    };
  }

  @Patch('business-information')
  @RequiredKYCGuard()
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'businessLogo' }, { name: 'businessRegistrationDocument' }],
      {
        dest: './upload',
        storage: multerStorage,
      },
    ),
  )
  async UpdateBusinessInformation(
    @Body(new ObjectValidationPipe(UpdateBusinessInformationValidator))
    data: BusinessInformationUpdateDto,
    @UploadedFiles()
    files: {
      businessLogo: Express.Multer.File;
      businessRegistrationDocument: Express.Multer.File;
    },
    @BusinessTokenDecorator()
    token: BusinessTokenDto,
  ) {
    const business = await this.cpayBusinessService.findById(data.businessId);
    if (files.businessLogo) {
      const file = await this.fileService.uploadDocument(
        files.businessLogo[0].filename,
        filelocationEnum.profileDocument,
      );
      data.businessLogo = file.secure_url;
    }
    if (files.businessRegistrationDocument) {
      const file = await this.fileService.uploadDocument(
        files.businessRegistrationDocument[0].filename,
        filelocationEnum.profileDocument,
      );
      data.businessRegistrationDocument = file.secure_url;
    }

    await this.cpayBusinessProfileService.findOneAndUpdate(
      {
        businessId: data.businessId,
      },
      {
        ...data,
      },
    );
    await this.cpayBusinessLocationService.findOneAndUpdate(
      {
        businessId: data.businessId,
      },
      {
        ...data,
      },
    );
    if (files.businessRegistrationDocument) {
      await this.cpayBusinessProfileService.findOneAndUpdate(
        {
          businessId: data.businessId,
        },
        {
          businessStatus: BussinessAccountStatus.Pending,
        },
      );
    }
    const businessProfile = await this.cpayBusinessProfileService.findOne({
      where: {
        businessId: data.businessId,
      },
    });
    if (data.registrationNumber) {
      const emailData: KYBVerificationDto = {
        businessId: data.businessId,
        number: data.registrationNumber,
        countryCode: CountryEnum.NGN,
      };
      this.eventEmitter.emitAsync(
        BusinessEventsEnum.KYB_VERIFICATION,
        emailData,
      );
    }
    return {
      message: 'Business profile updated successfully',
      data: businessProfile,
    };
  }

  @Patch('update-business-location')
  // @RequiredKYCGuard()
  async updateBusinessLocation(
    @Body(new ObjectValidationPipe(UpdateBusinessLocationValidator))
    data: BusinessLocationUpdateDto,
    @BusinessTokenDecorator()
    token: BusinessTokenDto,
  ) {
    let location = await this.cpayBusinessLocationService.findOne({
      where: {
        businessId: data.businessId,
      },
    });
    if (location) {
      await this.cpayBusinessLocationService.findOneAndUpdate(
        {
          businessId: data.businessId,
        },
        {
          ...data,
        },
      );
    } else {
      location = this.cpayBusinessLocationService.initialize({
        ...data,
      });
      await location.save();
    }

    return {
      message: 'Address updated successfully',
    };
  }

  @Patch('update-business-profile')
  // @RequiredKYCGuard()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'businessCertificateImage' },
        { name: 'businessRegistrationDocument' },
      ],
      {
        dest: './upload',
        storage: multerStorage,
      },
    ),
  )
  async updateBusinessProfile(
    @Body(new ObjectValidationPipe(UpdateBusinessProfileValidator))
    data: BusinessProfileUpdateDto,
    @UploadedFiles()
    files: {
      businessCertificateImage: Express.Multer.File;
      businessRegistrationDocument: Express.Multer.File;
    },
    @BusinessTokenDecorator()
    token: BusinessTokenDto,
  ) {
    if (files.businessCertificateImage) {
      const file = await this.fileService.uploadDocument(
        files.businessCertificateImage[0].filename,
        filelocationEnum.profileDocument,
      );
      data.businessCertificateImage = file.secure_url;
    }
    if (files.businessRegistrationDocument) {
      const file = await this.fileService.uploadDocument(
        files.businessRegistrationDocument[0].filename,
        filelocationEnum.profileDocument,
      );
      data.businessRegistrationDocument = file.secure_url;
    }
    let location = await this.cpayBusinessProfileService.findOne({
      where: {
        businessId: data.businessId,
      },
    });
    if (location) {
      await this.cpayBusinessProfileService.findOneAndUpdate(
        {
          businessId: data.businessId,
        },
        {
          ...data,
        },
      );
    } else {
      location = this.cpayBusinessProfileService.initialize({
        ...data,
      });
      await location.save();
    }

    return {
      message: 'Profile updated successfully',
    };
  }

  @Patch('update-2fa')
  async updateRates(
    @Body(new ObjectValidationPipe(Update2FaValidator))
    details: BusinessUser2FAUpdateDto,
    @BusinessTokenDecorator()
    token: BusinessTokenDto,
  ) {
    const user = await this.cpayUserService.findById(token.id);
    if (!user.authentication) {
      await this.cpayUserService.findByIdAndUpdate(token.id, {
        authentication: AccountAuthenticationDefault,
      });
    }
    await this.cpayUserService.findByIdAndUpdate(token.id, {
      authentication: {
        ...user.authentication,
        [details.key]: !user.authentication[details.key],
      },
    });
    return {
      message: `updated successfully`,
    };
  }

  @Patch('update-business-status')
  async confirmBusinessStatus(
    @Body(new ObjectValidationPipe(UpdateBusinessStatusValidator))
    details: BusinessStatusUpdateDto,
    @BusinessTokenDecorator()
    token: BusinessTokenDto,
  ) {
    const business = await this.cpayBusinessService.findOne({
      where: {
        id: details.businessId,
        businessStatus: BussinessAccountStatus.Active,
      },
    });
    if (!business) {
      throw new BadRequestException('Invalid operation for this business');
    }
    await this.cpayBusinessService.findByIdAndUpdate(details.businessId, {
      confirmStatus: true,
    });
    return {
      message: `Verification status confirmed successfully`,
    };
  }

  @Delete('personal-account')
  async deleteAccount(
    @Body(new ObjectValidationPipe(personalAccountDeletionValidator))
    details: PersonalAccountDeletionDto,
    @BusinessTokenDecorator()
    token: BusinessTokenDto,
  ) {
    const customer = await this.cpayUserService.findById(token.id);
    const customerBusinesses = await this.cpayBusinessService.findAll({
      where: {
        ownerId: token.id,
      },
    });
    if (customerBusinesses.length > 0) {
      for (const customerbusiness of customerBusinesses) {
        const wallets = await this.walletService.findAll({
          where: {
            businessId: customerbusiness.id,
          },
        });
        for (const wallet of wallets) {
          if (wallet.availableBalance > 1) {
            throw new BadRequestException(
              'Please withdraw a all wallet balances for the businesses you created to continue  ',
            );
          }
        }
      }
    }

    await this.cpayUserService.findByIdAndUpdate(customer.id, {
      deletedAt: new Date(),
    });
    // NOTE: Automatically clear and delete login token
    return {
      message: `Account deleted successfully`,
    };
  }
}
