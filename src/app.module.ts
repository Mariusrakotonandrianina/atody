import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import * as dotenv from 'dotenv';
import { AuthService } from './modules/auth/auth.service';
import { GoogleStrategy } from './modules/auth/google.strategy';
import { PassportModule } from '@nestjs/passport/dist';
import { AuthModule } from './modules/auth/auth.module';

// Charger manuellement le fichier .env avant d'utiliser process.env
dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.V_ENV,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000), // Convertit automatiquement en number
        DATABASE_PORT: Joi.number().default(5432), // Convertit automatiquement en number
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: String(process.env.DATABASE_PASSWORD),
      database: process.env.DATABASE_NAME,
      entities: [__dirname + '/**/*.entity.{ts,js}'],
      synchronize: true,
      autoLoadEntities: true,
    }),
    UserModule,
    AuthModule,
    PassportModule.register({ defaultStrategy: 'google' }),
  ],
  controllers: [AppController],
  providers: [AppService, AuthService, GoogleStrategy],
})
export class AppModule {}
