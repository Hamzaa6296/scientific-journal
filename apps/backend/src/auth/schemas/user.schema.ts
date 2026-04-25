/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../common/enums/role.enum';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform(doc, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      delete ret.password;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return ret;
    },
  },
})
export class User {
  @Prop({ required: true, trim: true })
  name: string;
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;
  @Prop({ required: true })
  password: string;
  @Prop({ type: String, enum: Role, default: Role.AUTHOR })
  role: Role;
  @Prop({ default: false })
  isEmailVerified: boolean;
  @Prop({ type: String, default: null })
  otp: string | null;
  @Prop({ type: Date, default: null })
  otpExpiresAt: Date | null;

  // ── Password reset OTP ──────────────────────────────────────────────────
  // Separate fields from email verification OTP so both flows can run
  // independently without stepping on each other. If a user is verifying
  // email AND resetting password at the same time (edge case), both work.
  @Prop({ type: String, default: null })
  resetOtp: string | null;

  @Prop({ type: Date, default: null })
  resetOtpExpiresAt: Date | null;

  @Prop({ trim: true, default: '' })
  affiliation: string;

  @Prop({ trim: true, default: '' })
  bio: string;

  @Prop({ type: [String], default: [] })
  expertise: string[];

  @Prop({ type: String, default: null })
  refreshToken: string | null;
}
export const UserSchema = SchemaFactory.createForClass(User);
