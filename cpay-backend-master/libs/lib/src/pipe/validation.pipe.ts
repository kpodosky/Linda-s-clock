import {
  ConflictException,
  Injectable,
  Logger,
  PipeTransform,
  UnauthorizedException,
} from '@nestjs/common';
import { ArraySchema, ObjectSchema, StringSchema } from 'joi';

@Injectable()
export class ObjectValidationPipe implements PipeTransform {
  constructor(private readonly schema: ObjectSchema) {}
  async transform(data: any): Promise<void> {
    try {
      if (!data) throw new ConflictException('input data not specified');
      const value = await this.schema
        .unknown(false)
        .validateAsync(data, { stripUnknown: true });
      Logger.debug('payload validation success....');
      return value;
    } catch (e) {
      Logger.debug('payload validation error....');
      throw new UnauthorizedException(e.message);
    }
  }
}

@Injectable()
export class ArrayValidationPipe implements PipeTransform {
  constructor(private readonly schema: ArraySchema) {}
  async transform(data: any[]): Promise<void> {
    try {
      Logger.debug('payload validation started....');
      if (!data || data.length === 0)
        throw new ConflictException('input data not specified');

      const value = await this.schema.validateAsync(data, {
        stripUnknown: true,
        convert: false,
      });
      Logger.debug('payload validation success....');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      return value;
    } catch (e) {
      Logger.debug('payload validation error....');
      throw new UnauthorizedException(e.message);
    }
  }
}

@Injectable()
export class StringValidationPipe implements PipeTransform {
  constructor(private readonly schema: StringSchema) {}
  async transform(data: any): Promise<void> {
    try {
      Logger.debug('payload validation started....');
      if (!data) throw new ConflictException('input data not specified');

      const value = await this.schema.validateAsync(data);
      Logger.debug('payload validation success....');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      return value;
    } catch (e) {
      Logger.debug('payload validation error....');
      throw new UnauthorizedException(e.message);
    }
  }
}
