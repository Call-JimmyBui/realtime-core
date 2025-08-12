import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from './helpers/loggerHelper';
import setupSwagger from './utils/setup-swagger';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Filters
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Cấu hình CORS cho HTTP endpoints (nếu có)
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  //Swagger
  setupSwagger(app)

  await app.listen(3000);  
  Logger.info(`---Server đang chạy tại http://localhost:3000---`);
}
bootstrap();