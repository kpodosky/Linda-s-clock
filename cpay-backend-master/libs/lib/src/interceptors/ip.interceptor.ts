// ip.middleware.ts
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as UAParser from 'ua-parser-js';
import axios from 'axios';
import { HttpService } from '@nestjs/axios';

export interface CustomRequest extends Request {
  clientIp?: string;
  userAgent?: string;
  deviceInfo?: any;
  location?: {
    latitude: number;
    longitude: number;
  };
}

@Injectable()
export class IpMiddleware implements NestMiddleware {
  async use(req: CustomRequest, res: Response, next: NextFunction) {
    const clientIp =
      req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    req.clientIp = Array.isArray(clientIp) ? clientIp[0] : clientIp;
    req.userAgent = req.headers['user-agent'];

    const parser = new UAParser();
    req.deviceInfo = parser.setUA(req.userAgent).getResult();

    if (req.clientIp) {
      try {
        const response = await axios.get(
          `https://ipinfo.io/${req.clientIp}/geo?token=0b5acc1b77ea1f`,
        );
        const { loc } = response.data;
        if (loc) {
          const [latitude, longitude] = loc.split(',');
          req.location = {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
          };
        }
      } catch (error) {
        Logger.error('Error fetching geolocation:', error);
      }
    }
    next();
  }
}
