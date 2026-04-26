// PURPOSE: The Users feature module.
//
// KEY DECISION — We import AuthModule here instead of re-registering
// the User schema. AuthModule already registers the User schema and
// exports MongooseModule — so importing AuthModule gives us access
// to the User model without duplicate registration.
//
// We also import AuthModule to get JwtStrategy and PassportModule
// so JwtAuthGuard works in this module's routes.

import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    // AuthModule exports:
    // 1. MongooseModule (with User model) → UsersService can inject User model
    // 2. JwtStrategy + PassportModule    → JwtAuthGuard works in UsersController
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
  // We export UsersService so future modules (e.g. PapersModule) can
  // inject it if they need user data
})
export class UsersModule {}
