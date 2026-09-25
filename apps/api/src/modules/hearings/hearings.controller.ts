import { Controller, Get } from '@nestjs/common';
import { HearingsService } from './hearings.service';

@Controller('hearings')
export class HearingsController {
  constructor(private readonly hearingsService: HearingsService) {}

  @Get('status')
  getStatus() {
    return this.hearingsService.getStatus();
  }
}
