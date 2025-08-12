import { Logger } from '@/helpers/loggerHelper';
import { type INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// READ https://docs.nestjs.com/openapi/introduction

function setupSwaggerSimple(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Swager')
    .setDescription('demo a auth')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  Logger.info(`Swagger UI: http://localhost:3000/api-docs`);
}

export default setupSwaggerSimple;
