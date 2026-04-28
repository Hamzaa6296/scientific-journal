import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { AuthModule } from '../auth/auth.module';
import { PapersModule } from '../papers/papers.module';
import { MailService } from '../auth/mail.service';

@Module({
  imports: [
    // PapersModule exports MongooseModule with Paper model
    // AuthModule exports MongooseModule with User model
    // Both are needed in ReviewsService
    PapersModule,
    AuthModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, MailService],
})
export class ReviewsModule {}
