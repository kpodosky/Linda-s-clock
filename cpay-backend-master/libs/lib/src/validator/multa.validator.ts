import { Injectable } from '@nestjs/common';
import {
  MulterOptionsFactory,
  MulterModuleOptions,
} from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';
import * as fs from 'fs';
@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    console.log('Heyyyyy');
    return {
      storage: diskStorage({
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
      }),
    };
  }
}
