/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// PURPOSE: The Auth feature module — declares and wires everything auth-related.
//
// WHAT IS A MODULE?
// Think of it as a self-contained box that says:
//   imports   → external things this module needs (DB, JWT, etc.)
//   controllers → HTTP route handlers
//   providers   → services, strategies (injectable classes)
//   exports     → things other modules can use when they import this module

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailService } from './mail.service';
import { JwtStrategy } from './strategies/jwt-strategy';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    ConfigModule,

    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('jwt.accessSecret');
        const expiresIn = config.get<string>('jwt.accessExpiresIn') || '15m';
        return {
          secret,
          signOptions: {
            // Cast to 'any' to satisfy the StringValue type from @nestjs/jwt
            // '15m', '7d' are valid values — the type definition is just overly strict
            expiresIn: expiresIn as any,
          },
        };
      },
    }),

    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, JwtStrategy],
  exports: [JwtStrategy, PassportModule, MongooseModule],
})
export class AuthModule {}
