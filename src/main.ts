import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>('CLIENT_ORIGIN') || '*',
    methods: 'GET,POST',
    credentials: true,
  });
  await app.listen(configService.get<number>('PORT') || 3030);
}
bootstrap();
