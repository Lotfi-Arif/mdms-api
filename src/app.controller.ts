import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): {
    greeting: string;
    message: string;
  } {
    return this.appService.getHello();
  }
}
