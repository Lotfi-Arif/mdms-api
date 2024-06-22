import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): {
    greeting: string;
    message: string;
  } {
    return {
      greeting: 'Hello World!',
      message: 'Welcome to the MDMS API!',
    };
  }
}
