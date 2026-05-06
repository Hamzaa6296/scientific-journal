// PURPOSE: Handles file uploads.
// Receives a PDF file from the frontend, saves it to the server's
// /uploads directory, and returns the publicly accessible URL.
// In production you would swap local disk storage for Cloudinary or S3.

import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync } from 'fs';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

// Make sure the uploads directory exists when the app starts
const uploadDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@Controller('upload')
export class UploadController {
  constructor(private configService: ConfigService) {}
  // POST /api/upload/pdf
  // Accepts a single file field named 'file'
  @UseGuards(JwtAuthGuard)
  @Post('pdf')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          // Generate a unique filename to prevent collisions
          // e.g. "a1b2c3d4-e5f6-...pdf"
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),

      // Only allow PDF files
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(
            new BadRequestException('Only PDF files are allowed'),
            false,
          );
        }
        cb(null, true);
      },

      // 10 MB max file size
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  uploadPdf(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Build the public URL that the frontend will store and display
    // In production replace this with your Cloudinary/S3 URL
    const backendUrl = this.configService.get<string>('backendUrl');
    const fileUrl = `${backendUrl}/api/upload/files/${file.filename}`;

    return {
      message: 'File uploaded successfully',
      fileUrl,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    };
  }

  // GET /api/upload/files/:filename
  // Serves the uploaded file so the frontend can display/download it
  @Get('files/:filename')
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(uploadDir, filename);

    if (!existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    return res.sendFile(filePath);
  }
}
