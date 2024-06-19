import { Controller } from '@nestjs/common';
import { FlutterwaveService } from '../service/flutterwave.service';

@Controller('supported-banks')
export class FlutterwaveController {
  constructor(private readonly flutterwaveService: FlutterwaveService) {}
}
