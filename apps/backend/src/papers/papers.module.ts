import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PapersController } from './papers.controller';
import { PapersService } from './papers.service';
import { Paper, PaperSchema } from './schema/paper.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    // Register the Paper schema for this module
    MongooseModule.forFeature([{ name: Paper.name, schema: PaperSchema }]),
    // AuthModule gives us JwtStrategy + PassportModule for guards
    AuthModule,
  ],
  controllers: [PapersController],
  providers: [PapersService],
  exports: [PapersService, MongooseModule],
  // Export MongooseModule so ReviewsModule (Phase 4) can access the Paper model
})
export class PapersModule {}
