import { Injectable } from '@nestjs/common';
import { extname } from 'path';

@Injectable()
export class StorageService {
  // This is a placeholder for actual storage logic (e.g., S3, Cloudinary, or Local)
  // For now, we'll assume files are handled by Multer and we just return the path/URL.

  getFileName(file: Express.Multer.File): string {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    return `${file.fieldname}-${uniqueSuffix}${ext}`;
  }
}
