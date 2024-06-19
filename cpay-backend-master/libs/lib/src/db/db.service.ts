import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { FindOptions, Op, Sequelize } from 'sequelize';
import { Model, ModelCtor } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import shortid from 'shortid';
import { PaginationOptionsDto } from '../dto/pagination.dto';
import { CountryEnum } from '../enum/country.enum';
import { customAlphabet } from 'nanoid';
import * as QRCode from 'qrcode';

@Injectable()
export class BaseService<T extends Model> {
  constructor(private readonly model: ModelCtor<T>) {}

  async findById(id: string): Promise<T | null> {
    const result = await this.model.findByPk(id);
    if (!result) {
      throw new ConflictException(`${this.model.name} record not found`);
    }
    ['password', 'qrcode', 'lastToken', 'passwordChange'].forEach(
      (prop) => delete result[prop],
    );

    return result;
  }

  async findByIdAndExclude(
    id: string,
    exclude: string[] = [],
  ): Promise<T | null> {
    const result = await this.model.findByPk(id);
    if (!result) {
      throw new ConflictException(`${this.model.name} record not found`);
    }
    // Exclude properties
    exclude.forEach((prop) => delete result[prop]);
    return result;
  }

  async findAll(
    data: FindOptions = {},
    include?: any,
    sort?: { [key: string]: 'ASC' | 'DESC' },
  ) {
    const options: FindOptions = {
      where: data.where || {},
      include: include || [],
      order: sort
        ? Object.entries(sort).map(([key, value]) => [key, value])
        : [['createdAt', 'DESC']],
    };
    options.attributes = {
      ...options.attributes,
      exclude: ['password', 'qrcode', 'lastToken', 'passwordChange', 'meta'],
    };

    return this.model.findAll(options);
  }

  async update(id: any, data: Partial<T>): Promise<[number, T[]]> {
    const [affectedCount, updatedRows] = await this.model.update(data, {
      where: { id: id },
      returning: true,
    });
    return [affectedCount, updatedRows];
  }

  async delete(id: any): Promise<number> {
    return this.model.destroy({ where: { id: id } });
  }

  async deleteBy(filter: any): Promise<number> {
    return this.model.destroy({ where: filter });
  }

  async findOneOrErrorOut(options: FindOptions) {
    options.attributes = {
      ...options.attributes,
      exclude: ['password', 'qrcode', 'lastToken', 'passwordChange', 'meta'],
    };
    const result = await this.model.findOne(options);
    if (!result) {
      throw new ConflictException(`${this.model.name} record not found`);
    }
    return result;
  }

  async findOne(options: FindOptions) {
    options.attributes = {
      ...options.attributes,
      exclude: ['password', 'qrcode', 'lastToken', 'passwordChange'],
    };
    return await this.model.findOne(options);
  }

  async noDuplicate(options: FindOptions) {
    const data = await this.model.findOne(options);
    if (data) {
      throw new BadRequestException(`${this.model.name} already exists`);
    }
  }

  async count(options: FindOptions) {
    return await this.model.count(options);
  }
  async sum(key, filter) {
    return this.model.sum(key, filter);
  }

  async increment(filter: any, updateUserDto: any) {
    return await this.model.increment(updateUserDto, filter);
  }

  async propExists(options: FindOptions) {
    return await this.model.count(options);
  }

  async findByIdAndUpdate<T extends Model>(
    id: any,
    data: any,
  ): Promise<number> {
    try {
      const result = await this.model.findByPk(id);
      if (!result) {
        throw new ConflictException(`${this.model.name} record not found`);
      }
      const [affectedCount] = await this.model.update(data, { where: { id } });

      return affectedCount;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findOneAndUpdate<T extends Model>(
    filter: any,
    data: any,
  ): Promise<number> {
    try {
      const result = await this.model.findOne({ where: filter });
      if (!result) {
        throw new ConflictException(`${this.model.name} record not found`);
      }
      const [affectedCount] = await this.model.update(data, { where: filter });

      return affectedCount;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async softDelete<T extends Model>(filter: any): Promise<number> {
    try {
      const result = await this.model.findOne({ where: filter });
      if (!result) {
        throw new ConflictException(`${this.model.name} record not found`);
      }
      const [affectedCount] = await this.model.update(
        { deletedAt: new Date() },
        { where: filter },
      );

      return affectedCount;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  generateQR = async (text) => {
    try {
      const qrCode = await QRCode.toDataURL(text);
      return qrCode;
    } catch (err) {
      console.error(err);
    }
  };

  roundUpToTwoDecimals = (num) => {
    return parseFloat(num.toFixed(2));
  };

  generateNanoId(
    alphabeths = '0123456789abcdefghijklmnopqrstuvwxyz',
    length = 5,
  ) {
    const nanoId = customAlphabet(alphabeths, length);
    // return nanoId();
    return nanoId;
  }

  generatePublicKeyNanoId(
    alphabeths = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    length = 5,
  ) {
    const nanoId1 = customAlphabet(alphabeths, length);
    const nanoId2 = customAlphabet(alphabeths, length);
    const nanoId3 = customAlphabet(alphabeths, length);
    const nanoId4 = customAlphabet(alphabeths, length);
    return `${nanoId1().toLowerCase()}-${nanoId2().toLowerCase()}-${nanoId3().toLowerCase()}-${nanoId4().toLowerCase()}`;
  }

  genereateUUID() {
    return uuidv4();
  }

  generateReferralCode() {
    return shortid.generate();
  }

  generateReference(length = 10) {
    return `cpay_ref_${uuidv4()
      .replace(/-/gi, '')
      .slice(1, length + 1)}`;
  }

  generateId(length = 10) {
    return `${uuidv4()
      .replace(/-/gi, '')
      .slice(1, length + 1)}`;
  }

  async getNearbyRecordsByCoordinates<T>(
    longitude: number,
    latitude: number,
    maxDistanceInKm: number,
    coordinatesField: string,
  ): Promise<T[]> {
    const sequelize = this.model.sequelize as Sequelize;
    return this.model.findAll<any>({
      where: sequelize.literal(`
        ST_Distance_Sphere(
          ST_MakePoint(${longitude}, ${latitude}),
          ${coordinatesField}
        ) <= ${maxDistanceInKm * 1000}
      `),
    });
  }

  async getNearbyRecordsByCoordinates1(
    coordinates: number[],
    maxDistanceInMeter: number,
    geoLocationKey: string,
  ) {
    const sequelize: any = this.model.sequelize;

    // Use placeholders for parameters
    const sequelizeQuery = `
      SELECT *,
      (6371000 * acos(cos(radians(?)) * cos(radians(${geoLocationKey}->>'latitude')) * cos(radians(${geoLocationKey}->>'longitude') - radians(?)) + sin(radians(?)) * sin(radians(${geoLocationKey}->>'latitude')))) AS distance
      FROM your_table
      HAVING distance <= ?
      ORDER BY distance
    `;

    const replacements = [
      coordinates[1],
      coordinates[0],
      coordinates[1],
      maxDistanceInMeter,
    ];

    return sequelize.query(sequelizeQuery, {
      type: 'SELECT', // Specify query type as a string
      mapToModel: true,
      replacements, // Pass the parameter values as an array
    });
  }

  async paginatedResult(options: PaginationOptionsDto<T>) {
    const { page = 1, limit = 10 } = options;

    const offset = (page - 1) * limit;
    options.attributes = {
      ...options.attributes,
      exclude: ['password', 'qrcode', 'lastToken', 'passwordChange'],
    };

    const { rows, count } = await this.model.findAndCountAll({
      where: options.where,
      offset,
      limit,
      order: options.order,
      include: options.include,
      attributes: options.attributes,
    });

    const totalPages = Math.ceil(count / limit);

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
      },
    };
  }

  dateFormatter(date: Date) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      weekday: 'short',
      year: 'numeric',
    });
  }

  dateFormatterWithTime(date: Date) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      weekday: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  dayMonthYearDateFormatter1 = (dateStr: Date) => {
    const dateObj = new Date(dateStr);

    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear().toString();

    return `${day}-${month}-${year}`;
  };

  dayMonthYearDateFormatter = (dateStr: Date) => {
    const dateObj = new Date(dateStr);

    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear().toString();

    return `${day}-${month}-${year}`;
  };

  dayMonthYearDateFormatter2 = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');

    return `${day}-${month}-${year}`;
  };
  getFormattedTimestamp() {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  currencyFormatter() {
    return Intl.NumberFormat('en-US');
  }

  currencyLogo = (country: CountryEnum) => {
    let logo;
    switch (country) {
      case CountryEnum.NGN:
        logo = '₦';
        break;
      case CountryEnum.USD:
        logo = '$';
        break;
    }
    return logo;
  };
}
