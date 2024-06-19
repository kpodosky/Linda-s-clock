// batch-email.cron.ts
import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';

@Injectable()
export class BatchEmailCron {
  constructor(private readonly emailService: EmailService) {}

  @Cron(CronExpression.EVERY_30_MINUTES) // Adjust the cron expression as needed
  async handleCron(): Promise<void> {
    const users = await this.getUsersToEmail(); // Implement your logic to get users for the batch
    const batchSize = 100; // Set the batch size based on your resource constraints

    // Process emails in batches
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      await this.emailService.sendHostedMail(batch);
    }
  }

  private async getUsersToEmail(): Promise<string[]> {
    // Implement your logic to retrieve users for the batch (e.g., from a database)
    return ['user1@example.com', 'user2@example.com' /* ... */];
  }
}
