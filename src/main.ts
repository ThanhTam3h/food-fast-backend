import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express, { urlencoded } from 'express';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import { TransformInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   app.enableCors({
    origin: 'https://food-fast-frontend.vercel.app', // URL mặc định Vite
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });

  const logger = new Logger('bootstrap');

  const configService = new ConfigService();

  app.setGlobalPrefix('api/v1');

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Raw body only for Stripe
  app.use('/api/v1/stripe/webhook', express.raw({ type: '*/*' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // Cho phép ép kiểu tự động
      },
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionFilter());

 

  const config = new DocumentBuilder()
    .setTitle('FastFood Delivery APIs')
    .setDescription('Build APIs for fastfood delivery website')
    .setVersion('1.0')
    .addBearerAuth(
      // Thêm dòng này để bật JWT trong Swagger
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Nhập token dạng: Bearer <jwt_token>',
        in: 'header',
      },
      'access-token', // Tên định danh
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  const port = configService.get<string>('PORT') || 3000;
  const PUBLIC_DOMAIN = 'https://food-fast-backend-production.up.railway.app';

  logger.log(`Server startedand available at ${PUBLIC_DOMAIN}/api/v1`);
  logger.log(`Swagger running on ${PUBLIC_DOMAIN}/api/v1/docs`);

  await app.listen(port);
}
bootstrap();
