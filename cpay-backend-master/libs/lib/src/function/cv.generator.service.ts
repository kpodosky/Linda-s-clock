// csv.service.ts

import { createObjectCsvWriter } from 'csv-writer';
import { Injectable, Res } from '@nestjs/common';
import * as path from 'path';
import { stringify } from 'csv-stringify/sync';
import * as fs from 'fs';
import { Response } from 'express';

@Injectable()
export class CsvService {
  async writeCsv(fileName: string, records: any[]) {
    const csvWriter = createObjectCsvWriter({
      path: fileName,
      header: Object.keys(records[0]).map((key) => ({ id: key, title: key })),
    });
    await csvWriter.writeRecords(records);
  }

  async writeCsv2(filePath: string, records: any[], res?: Response) {
    const csvData = stringify(records, { header: true });

    // Write CSV data to file
    fs.writeFileSync(filePath, csvData);
    const fullFilePath = path.join(process.cwd(), filePath);
    res.setHeader('Content-Disposition', `attachment; filename=${filePath}`);
    res.setHeader('Content-Type', 'text/csv');
    return {
      fullFilePath,
    };
  }
}
