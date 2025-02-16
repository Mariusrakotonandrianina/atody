import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const databasePort = configService.get<number>('DATABASE_PORT');
  const salt = configService.get<number>('SALT_ROUNDS');

  await app.listen(port);
  console.log(`Serveur démarré sur le port ${port}`);
  console.log(`Database tourne sur le port ${databasePort}`);
}

bootstrap();
