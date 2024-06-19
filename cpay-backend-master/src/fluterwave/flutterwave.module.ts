import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FlutterwaveService } from './service/flutterwave.service';
import { FlutterwaveController } from './controller/flutterwave.controller';
@Global()
@Module({
  controllers: [FlutterwaveController],
  providers: [FlutterwaveService],
  imports: [HttpModule],
  exports: [FlutterwaveService],
})
export class FlutterwaveModule {}
