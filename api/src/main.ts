import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.enableShutdownHooks();

  // Security & parsing
  app.use(helmet());
  app.use(cookieParser());

  // CORS: keep permissive for local dev; lock down in prod via env later
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // API standards
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger
  const swaggerPath = process.env.SWAGGER_PATH ?? 'docs';
  const swaggerConfig = new DocumentBuilder()
    .setTitle('IMS Backend API')
    .setDescription('Inventory Management System (Sanitary & Electrical)')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token',
    )
    .build();
  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(swaggerPath, app, swaggerDoc, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');

  const baseUrl = await app.getUrl();
  const logger = new Logger('Bootstrap');
  const apiBase = `${baseUrl}/api/v1`;
  const swaggerUrl = `${baseUrl}/${swaggerPath}`;
  const openApiJsonUrl = `${swaggerUrl}-json`;

  logger.log(`Environment: ${process.env.NODE_ENV ?? 'development'}`);
  logger.log(`Listening:   ${baseUrl}`);
  logger.log(`API Base:    ${apiBase}`);
  logger.log(`Swagger UI:  ${swaggerUrl}`);
  logger.log(`OpenAPI:     ${openApiJsonUrl}`);
}

void bootstrap();
