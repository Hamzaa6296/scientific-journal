// PURPOSE: The root module — the top of the entire module tree.
// All feature modules (AuthModule, PapersModule, etc.) get imported here.
// Global configurations (DB connection, env config) also go here.

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { UsersModule } from './users/users.module';
import { PapersModule } from './papers/papers.module';

@Module({
  imports: [
    // isGlobal: true → ConfigService is available everywhere without re-importing
    // load: [configuration] → our typed config factory from config/configuration.ts
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),

    // Connects to MongoDB once at app startup.
    // forRootAsync = use ConfigService (which loads after ConfigModule)
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('database.uri'),
      }),
    }),

    // Auth feature module — handles all /api/auth/* routes
    // As we build phases 2, 3, 4... we add more modules here
    AuthModule,
    UsersModule,
    PapersModule,
  ],
})
export class AppModule {}
