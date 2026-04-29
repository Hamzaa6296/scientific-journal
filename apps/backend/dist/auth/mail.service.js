"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let MailService = MailService_1 = class MailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(MailService_1.name);
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('mail.host'),
            port: this.configService.get('mail.port'),
            secure: true,
            requireTLS: true,
            auth: {
                user: this.configService.get('mail.user'),
                pass: this.configService.get('mail.pass'),
            },
            tls: {
                rejectUnauthorized: false,
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
        });
    }
    async sendOtpEmail(to, name, otp) {
        const html = this.buildOtpEmailHtml(name, otp, 'Verify Your Email', 'Please use the code below to verify your email address.');
        await this.sendMail(to, 'Verify Your Email — Scientific Journal', html);
    }
    async sendPasswordResetOtpEmail(to, name, otp) {
        const html = this.buildOtpEmailHtml(name, otp, 'Reset Your Password', 'Use the code below to reset your password. If you did not request this, please ignore this email.');
        await this.sendMail(to, 'Password Reset Code — Scientific Journal', html);
    }
    async sendReviewInvitationEmail(to, reviewerName, paperTitle, paperId) {
        const reviewUrl = `${this.configService.get('frontendUrl')}/reviewer/papers/${paperId}`;
        const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Georgia, serif; background: #f5f5f0; padding: 20px; margin: 0; }
          .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 4px; overflow: hidden; }
          .header { background: #1a1a2e; padding: 32px; text-align: center; }
          .header h1 { color: #c9a84c; margin: 0; font-size: 20px; letter-spacing: 2px; text-transform: uppercase; }
          .body { padding: 40px 32px; color: #333; font-size: 15px; line-height: 1.7; }
          .paper-box { background: #f5f5f0; border-left: 4px solid #c9a84c; padding: 16px 20px; margin: 24px 0; }
          .paper-title { font-weight: bold; font-size: 16px; color: #1a1a2e; }
          .btn { display: inline-block; background: #1a1a2e; color: #c9a84c; text-decoration: none; padding: 14px 32px; border-radius: 4px; font-size: 15px; margin: 20px 0; }
          .footer { background: #f5f5f0; padding: 16px 32px; text-align: center; }
          .footer p { color: #999; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>Scientific Journal</h1></div>
          <div class="body">
            <p>Dear ${reviewerName},</p>
            <p>You have been invited to review the following manuscript:</p>
            <div class="paper-box">
              <div class="paper-title">${paperTitle}</div>
            </div>
            <p>As a reviewer, you will be asked to evaluate the manuscript and provide a recommendation. Please accept or decline this invitation at your earliest convenience.</p>
            <div style="text-align: center;">
              <a href="${reviewUrl}" class="btn">View & Respond</a>
            </div>
            <p>Regards,<br>The Editorial Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
        await this.sendMail(to, 'Invitation to Review a Manuscript — Scientific Journal', html);
    }
    buildOtpEmailHtml(name, otp, heading, description) {
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
    async sendMail(to, subject, html) {
        try {
            await this.transporter.sendMail({
                from: this.configService.get('mail.from'),
                to,
                subject,
                html,
            });
            this.logger.log(`Email sent to ${to}`);
        }
        catch (error) {
            const errorStack = error instanceof Error ? error.stack : String(error);
            this.logger.error(`Failed to send email to ${to}`, errorStack);
            throw new common_1.InternalServerErrorException('Failed to send email. Please try again.');
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map