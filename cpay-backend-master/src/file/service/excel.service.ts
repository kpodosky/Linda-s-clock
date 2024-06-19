// excel.service.ts
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs-extra';

@Injectable()
export class ExcelService {
  async exportTransactionData(
    transactions: any[],
    filePath: string,
  ): Promise<void> {
    // const workbook = new ExcelJS.Workbook();
    // const worksheet = workbook.addWorksheet('Transactions');

    // // Add headers
    // worksheet.addRow(['Transaction ID', 'Amount', 'Date', 'Description']);

    // // Add transaction data
    // transactions.forEach((transaction) => {
    //   worksheet.addRow([
    //     transaction.id,
    //     transaction.amount,
    //     transaction.date,
    //     transaction.description,
    //   ]);
    // });

    // // Write to file
    // await workbook.xlsx.writeFile(filePath);
  }
}
