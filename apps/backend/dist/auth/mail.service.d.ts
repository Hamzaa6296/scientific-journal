import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    sendOtpEmail(to: string, name: string, otp: string): Promise<void>;
    sendPasswordResetOtpEmail(to: string, name: string, otp: string): Promise<void>;
    private buildOtpEmailHtml;
    private sendMail;
}
