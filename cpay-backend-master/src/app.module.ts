import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './db/db.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envValidator } from './env/validator/env.validator';
import { MulterModule } from '@nestjs/platform-express';
import { LoggerModule } from './logger/logger.module';
import { TokenModule } from '@app/lib/token/token.module';
import { MulterConfigService } from '@app/lib/validator/multa.validator';
import { FlutterwaveModule } from './fluterwave/flutterwave.module';
import { TransactionModule } from './transaction/transaction.module';
import { BankAccountModule } from './bank/bank.module';
import { ActivityModule } from './activities/activities.module';
import { FireBlocksModule } from './fire-blocks/fire-blocks.module';
import { BusinessModule } from './business/business.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AdminModule } from './admin/admin.module';
import { PaymentLinkModule } from './payment/payment.module';
import { IpMiddleware } from '@app/lib/interceptors/ip.interceptor';
import { RateModule } from './rate/rate.module';
import { WaitListModule } from './waitlist/waitlist.module';
import { TokenGuard } from '@app/lib/token/guard/token.guard';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EmailModule } from './email/email.module';
import { GlobalExceptionFilter } from '@app/lib/exceptions';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { SecurityMiddleware } from '@app/lib/interceptors/security.middleware';
import { AppService } from './app.service';
import { OtpModule } from './otp/otp.module';
import { WalletModule } from './wallet/wallet.module';
import { IdentityVerificationModule } from './identity-verification/identity.module';
import { BullModule } from '@nestjs/bull';
import { CronJobModule } from './cron-job/cron-job.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AppConfigModule } from './app-config/app-config.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      validationSchema: envValidator,
    }),
    MulterModule.registerAsync({
      useClass: MulterConfigService,
      // storage: multerStorage,
    }),
    ScheduleModule.forRoot(),
    LoggerModule,
    TokenModule,
    FlutterwaveModule,
    TransactionModule,
    BankAccountModule,
    ActivityModule,
    FireBlocksModule,
    BusinessModule,
    AuthenticationModule,
    EmailModule,
    OtpModule,
    WalletModule,
    AppConfigModule,
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      ignoreErrors: false,
    }),
    AdminModule,
    PaymentLinkModule,
    RateModule,
    WaitListModule,
    IdentityVerificationModule,
    CronJobModule,
    ThrottlerModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const limit = config.get('THROTTLE_LIMIT');
        const ttl = config.get('THROTTLE_TTL');
        return [
          {
            ttl,
            limit,
          },
        ];
      },
      inject: [ConfigService],
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'paymentLinkActions',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    IpMiddleware,
    { provide: APP_GUARD, useClass: TokenGuard },
    {
      provide: APP_FILTER,
      useFactory: (config: ConfigService) => {
        return new GlobalExceptionFilter(config);
      },
      inject: [ConfigService],
    },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    return consumer
      .apply(IpMiddleware, SecurityMiddleware)
      .exclude('health')
      .forRoutes({
        path: '*',
        method: RequestMethod.ALL,
      });
  }
}
