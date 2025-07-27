// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io'; // Import IoAdapter
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cấu hình Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các thuộc tính không có trong DTO
      transform: true, // Tự động chuyển đổi kiểu dữ liệu (ví dụ: chuỗi sang số)
    }),
  );

  // Cấu hình Socket.IO Adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // Cấu hình CORS cho HTTP endpoints (nếu có)
  app.enableCors({
    origin: '*', // Hoặc chỉ định rõ frontend URL: 'http://localhost:3000'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3001); // Cổng cho HTTP/REST API
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();