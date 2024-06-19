import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { FileTypeEnum } from '../enum/file.enum';
import { createWriteStream } from 'fs';
import { promisify } from 'util';
import { readFileSync } from 'fs';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';

export const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync('./upload'))
      fs.mkdirSync('./upload', {
        mode: '0777',
      });
    cb(null, './upload');
  },
  filename: function (req, file, cb) {
    const extension = file.originalname.split('.')[1];
    cb(null, `${new Date().getTime()}.${extension}`);
  },
});

@Injectable()
export class FileService {
  private readonly baseUrl = cloudinary;

  constructor(
    private readonly configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.baseUrl.config({
      cloud_name: this.configService.get('CLOUDINARY_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadDocument(url: any, location): Promise<any> {
    try {
      const file = path.join(process.cwd(), 'upload', `/${url}`);

      Logger.log(`Updaloding file in progress...`);
      const { secure_url, public_id, format, resource_type } =
        await this.baseUrl.uploader.upload(file, {
          folder: location,
        });
      return { secure_url, public_id, format, resource_type };
    } catch (error) {
      Logger.log('File upload failed...', error);
      throw new BadRequestException('Unable to upload file');
    }
  }

  getFileType(file: Express.Multer.File) {
    // TODO: consider looking at other possible types and add them here
    const [mimeType, fileExtension] = file.mimetype.split('/');
    const imageFileTypes = ['image'];
    const documentFileExtensionType = ['pdf'];
    const videoFileType = ['video'];
    const audioFileType = ['audio'];
    //
    if (imageFileTypes.includes(mimeType)) {
      return FileTypeEnum.Image;
    } else if (documentFileExtensionType.includes(fileExtension)) {
      return FileTypeEnum.Document;
    } else if (videoFileType.includes(mimeType)) {
      return FileTypeEnum.Video;
    } else if (audioFileType.includes(mimeType)) {
      return FileTypeEnum.Audio;
    }
  }

  async uploadDocumentBase64(url: string, location: string): Promise<any> {
    try {
      const { secure_url, public_id } = await this.baseUrl.uploader.upload(
        url,
        {
          folder: location,
        },
      );
      return { secure_url, public_id };
    } catch (error) {
      Logger.log('File upload failed...', error);
      console.log('File upload failed...', error);
      throw new BadRequestException('Unable to upload file');
    }
  }

  async exportDataToCSV(data: any[], filePath: string): Promise<void> {
    const writeStream = createWriteStream(filePath);
    const asyncWrite = promisify(writeStream.write).bind(writeStream);

    try {
      // Write CSV header
      const headers = Object.keys(data[0]).join(',') + '\n';
      await asyncWrite(headers);

      // Write data to the file
      for (const item of data) {
        console.log('...', item);
        const values = Object.values(item).join(',') + '\n';
        await asyncWrite(values);
      }
    } catch (error) {
      throw new Error(`Error exporting data to CSV file: ${error.message}`);
    } finally {
      writeStream.end();
    }
  }

  // async convertImageToBase64(url: string): Promise<string> {
  //   try {
  //     const buffer = readFileSync(url, 'binary');
  //     const base64Image = Buffer.from(buffer).toString('base64');
  //     return `data:image/jpeg;base64,${base64Image}`;
  //   } catch (error) {
  //     console.error('Error reading image:', error);
  //     throw new Error('Failed to convert image to base64');
  //   }
  // }

  async convertImageToBase64(url: string): Promise<string> {
    try {
      const headers = {};
      const response: AxiosResponse<any> = await this.httpService
        .get(`${url}`, { headers })
        .toPromise();
      // const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = response.data;
      const base64Image = Buffer.from(buffer).toString('base64');
      return `data:image/jpeg;base64,${base64Image}`;
    } catch (error) {
      console.error('Error fetching image:', error);
      throw new Error('Failed to convert image to base64');
    }
  }
}
