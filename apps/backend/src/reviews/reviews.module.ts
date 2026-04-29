import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { AuthModule } from '../auth/auth.module';
import { PapersModule } from '../papers/papers.module';
import { MailService } from '../auth/mail.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    // PapersModule exports MongooseModule with Paper model
    // AuthModule exports MongooseModule with User model
    // Both are needed in ReviewsService
    PapersModule,
    AuthModule,
    NotificationsModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, MailService],
})
export class ReviewsModule {}
