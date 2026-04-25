/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      secure: true,
      requireTLS: true,
      auth: {
        user: this.configService.get<string>('mail.user'),
        pass: this.configService.get<string>('mail.pass'),
      },
      tls: {
        rejectUnauthorized: false, // prevents cert errors on some networks
      },
      connectionTimeout: 10000, // 10 seconds before giving up
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }

  // ─── SIGNUP OTP EMAIL ──────────────────────────────────────────────────────

  async sendOtpEmail(to: string, name: string, otp: string): Promise<void> {
    const html = this.buildOtpEmailHtml(
      name,
      otp,
      'Verify Your Email',
      'Please use the code below to verify your email address.',
    );
    await this.sendMail(to, 'Verify Your Email — Scientific Journal', html);
  }

  // ─── PASSWORD RESET OTP EMAIL ──────────────────────────────────────────────

  async sendPasswordResetOtpEmail(
    to: string,
    name: string,
    otp: string,
  ): Promise<void> {
    const html = this.buildOtpEmailHtml(
      name,
      otp,
      'Reset Your Password',
      'Use the code below to reset your password. If you did not request this, please ignore this email.',
    );
    await this.sendMail(to, 'Password Reset Code — Scientific Journal', html);
  }

  // ─── PRIVATE: SHARED OTP HTML TEMPLATE ────────────────────────────────────
  // Both signup OTP and reset OTP use the same visual template.
  // We just change the heading and description text.

  private buildOtpEmailHtml(
    name: string,
    otp: string,
    heading: string,
    description: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Georgia, serif; background: #f5f5f0; padding: 20px; margin: 0; }
            .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 4px; overflow: hidden; }
            .header { background: #1a1a2e; padding: 32px; text-align: center; }
            .header h1 { color: #c9a84c; margin: 0; font-size: 20px; letter-spacing: 2px; text-transform: uppercase; }
            .body { padding: 40px 32px; color: #333; font-size: 15px; line-height: 1.7; }
            .heading { font-size: 20px; font-weight: bold; color: #1a1a2e; margin-bottom: 12px; }
            .otp-box { background: #f5f5f0; border: 2px solid #1a1a2e; border-radius: 4px; padding: 24px; text-align: center; margin: 28px 0; }
            .otp-code { font-size: 38px; font-weight: bold; letter-spacing: 12px; color: #1a1a2e; font-family: monospace; }
            .expiry { color: #888; font-size: 13px; margin-top: 10px; }
            .footer { background: #f5f5f0; padding: 16px 32px; text-align: center; }
            .footer p { color: #999; font-size: 12px; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Scientific Journal</h1>
            </div>
            <div class="body">
              <p>Dear ${name},</p>
              <div class="heading">${heading}</div>
              <p>${description}</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <div class="expiry">This code expires in 10 minutes</div>
              </div>
              <p>Regards,<br>The Editorial Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // ─── PRIVATE: CORE SEND ────────────────────────────────────────────────────

  private async sendMail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('mail.from'),
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : String(error);
      this.logger.error(`Failed to send email to ${to}`, errorStack);
      throw new InternalServerErrorException(
        'Failed to send email. Please try again.',
      );
    }
  }
}
