import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomLogger } from './logger/service/logger.service';
import { ConfigService } from '@nestjs/config';
import { LoggerInterceptor } from './logger/interceptor/logger.interceptor';
import { ConfigEnum } from './env/enum/env.enum';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as session from 'express-session';
import * as express from 'express';
// import * as csurf from 'csurf';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NotFoundExceptionFilter } from '@app/lib/interceptors/not-found.middleware';
import { BusinessRoleGuard } from '@app/lib/guards/role.guard';
import { SecurityMiddleware } from '@app/lib/interceptors/security.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = [
    'https://cpay-frontend.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://cpay-admin-frontend.vercel.app',
    'https://www.theclockchain.io',
    'http://localhost:5173',
    'https://cpay.theclockchain.io',
    'https://tawk.to/chat/6662a9be9a809f19fb3ae27d/1hvome48t',
    // Add more frontend URLs as needed
  ];
  app.enableCors({
    origin: allowedOrigins,
  });
  // app.use(csurf());
  const config = app.get(ConfigService);
  const port = config.get(ConfigEnum.PORT);
  const reflector = app.get(Reflector);

  app.useLogger(new CustomLogger(config));
  app.use(
    session({
      secret: config.get('TOKEN_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 60 * 60,
      },
    }),
  );
  app.use(express.json({ limit: '500mb' }));
  app.use(express.urlencoded({ limit: '500mb', extended: true }));
  app.useGlobalInterceptors(new LoggerInterceptor());
  app.use(helmet.frameguard({ action: 'deny' }));
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        frameAncestors: ["'none'"],
      },
    }),
  );
  app.enableCors();
  const swagconfig = new DocumentBuilder()
    .setTitle('CPay API Documentation')
    .setDescription('CPay API Documentation')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, swagconfig);
  SwaggerModule.setup('swag', app, document);

  // set version one to the global prefix
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new NotFoundExceptionFilter());
  app.useGlobalGuards(new BusinessRoleGuard(reflector));
  app.use(new SecurityMiddleware().use);

  app.setGlobalPrefix('api/v1');
  await app.listen(port);
  Logger.debug(`LISTENING ON PORT ${port}`);
}
bootstrap();
