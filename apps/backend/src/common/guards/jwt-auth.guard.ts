/* eslint-disable @typescript-eslint/no-unsafe-call */
// PURPOSE: Blocks any request that doesn't have a valid JWT token.
//
// WHAT IS A GUARD?
// A Guard is a class that runs BEFORE the controller method.
// It returns true (let request through) or false/throws (block request).
// Think of it as a bouncer at the door.
//
// HOW TO USE IT:
//   @UseGuards(JwtAuthGuard)   ← on a single route
//   @UseGuards(JwtAuthGuard)   ← on a whole controller class
//
// When it sees "Authorization: Bearer <token>", it calls JwtStrategy.validate().
// If the token is invalid or missing → 401 Unauthorized automatically.

import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JWTAuthGuard extends AuthGuard('jwt') {
  // 'jwt' matches the strategy name in JwtStrategy.
  // The parent AuthGuard handles all the token extraction and validation.
  // We don't need to add any logic here.
}
