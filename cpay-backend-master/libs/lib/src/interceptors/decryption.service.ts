// decryption.service.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class DecryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key = 'your-secret-key'; // Replace with your own secret key

  decrypt(encryptedData: string): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(this.key),
      Buffer.from(encryptedData, 'hex'),
    );
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
