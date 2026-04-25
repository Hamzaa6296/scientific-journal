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
import { ConfigService } from '@nestjs/config';
import { SignOptions } from 'jsonwebtoken';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailService } from './mail.service';
import { JwtStrategy } from './strategies/jwt-strategy';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    // Sets JWT as the default Passport strategy
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Configures JWT signing. registerAsync = read config values asynchronously
    // (because ConfigModule loads after the module definition runs)
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.accessSecret'),
        signOptions: {
          expiresIn: config.get<string>(
            'jwt.accessExpiresIn',
          ) as SignOptions['expiresIn'],
        },
      }),
    }),

    // Registers the User schema for this module.
    // This is what makes @InjectModel(User.name) work in our services.
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],

  controllers: [AuthController],

  providers: [AuthService, MailService, JwtStrategy],

  exports: [
    // Export these so other modules (e.g. UsersModule) don't need to
    // re-configure JWT/Passport when they import AuthModule
    JwtStrategy,
    PassportModule,
    MongooseModule, // exports the User model to other modules
  ],
})
export class AuthModule {}
