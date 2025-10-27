import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import { TransformInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger('bootstrap');

  const configService = new ConfigService();

  app.setGlobalPrefix('/api/v1');

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

  app.enableCors({
    origin: 'http://localhost:5173', // URL mặc định Vite
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

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
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, documentFactory);

  const port = configService.get<string>('PORT') || 3000;

  logger.log(`Server started on ${port}`);
  logger.log(`Swagger running on http://localhost:${port}/api/v1/docs`)

  await app.listen(port);
}
bootstrap();
