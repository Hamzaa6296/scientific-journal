// PURPOSE: Teaches Passport HOW to validate a JWT token on protected routes.
//
// THE FLOW (every time a protected route is hit):
// 1. JwtAuthGuard intercepts the request
// 2. Extracts the token from "Authorization: Bearer <token>"
// 3. Verifies the signature using our JWT_ACCESS_SECRET
// 4. If signature valid + not expired → calls validate() below
// 5. validate() returns an object → this becomes req.user in the controller
//
// THE PAYLOAD:
// When we CREATE a token (in auth.service.ts), we embed: { sub, email, role }
// When this strategy VALIDATES a token, we get that payload back decoded.

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User, UserDocument } from '../schemas/user.schema';

export interface JwtPayload {
  sub: string; // MongoDB user _id (standard JWT "subject" field)
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super({
      // WHERE to look for the token in incoming requests
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // false → reject expired tokens (never set to true in production)
      ignoreExpiration: false,

      // Must match the secret used to SIGN the token in auth.service.ts
      secretOrKey: configService.get<string>('jwt.accessSecret'),
    });
  }

  // Called after signature + expiry are confirmed valid.
  // `payload` = the decoded token data ({ sub, email, role }).
  // Whatever we RETURN here becomes req.user in every protected controller.
  async validate(payload: JwtPayload) {
    const user = await this.userModel.findById(payload.sub).exec();

    if (!user) {
      // Token was valid but user was deleted after it was issued
      throw new UnauthorizedException('User no longer exists');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    // This is req.user from now on — used in controllers as @Request() req
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
