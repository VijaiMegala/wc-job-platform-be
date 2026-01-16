import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Upload image to Cloudinary
   * @param file - Multer file object
   * @param folder - Optional folder path in Cloudinary
   * @returns Promise with upload result containing secure_url and public_id
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'organization-logos',
  ): Promise<{ url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' },
          ],
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error('Cloudinary upload error:', error);
            reject(new Error(`Failed to upload image: ${error.message}`));
          } else if (result) {
            this.logger.log(`Image uploaded successfully: ${result.public_id}`);
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
            });
          } else {
            reject(new Error('Unknown error during upload'));
          }
        },
      );

      // Convert buffer to stream
      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);

      bufferStream.pipe(uploadStream);
    });
  }

  /**
   * Delete image from Cloudinary using public_id or URL
   * @param identifier - public_id or full URL of the image
   * @returns Promise with deletion result
   */
  async deleteImage(identifier: string): Promise<{ result: string }> {
    try {
      // Extract public_id from URL if full URL is provided
      let publicId = identifier;

      // If it's a URL, extract the public_id
      if (identifier.includes('cloudinary.com')) {
        // Extract public_id from URL like: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
        const urlParts = identifier.split('/');
        const uploadIndex = urlParts.findIndex((part) => part === 'upload');
        if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
          // Get everything after 'upload' and before the file extension
          const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
          // Remove version and file extension
          publicId = pathAfterUpload
            .split('/')
            .slice(1) // Skip version (v1234567890)
            .join('/')
            .replace(/\.[^/.]+$/, ''); // Remove file extension
        }
      }

      // If public_id includes folder, keep it; otherwise try to construct it
      if (!publicId.includes('/')) {
        publicId = `organization-logos/${publicId}`;
      }

      this.logger.log(`Deleting image with public_id: ${publicId}`);

      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
      });

      if (result.result === 'ok' || result.result === 'not found') {
        this.logger.log(`Image deleted successfully: ${publicId}`);
        return { result: result.result };
      } else {
        throw new Error(`Failed to delete image: ${result.result}`);
      }
    } catch (error) {
      this.logger.error('Cloudinary delete error:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * Extract public_id from Cloudinary URL
   * @param url - Cloudinary URL
   * @returns public_id or null if extraction fails
   */
  extractPublicId(url: string): string | null {
    try {
      if (!url.includes('cloudinary.com')) {
        return null;
      }

      const urlParts = url.split('/');
      const uploadIndex = urlParts.findIndex((part) => part === 'upload');
      if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
        const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
        const publicId = pathAfterUpload
          .split('/')
          .slice(1) // Skip version
          .join('/')
          .replace(/\.[^/.]+$/, ''); // Remove file extension
        return publicId;
      }
      return null;
    } catch (error) {
      this.logger.error('Error extracting public_id:', error);
      return null;
    }
  }
}

