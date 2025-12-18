import { Injectable } from '@nestjs/common';
import { RootConfig } from '../config';

@Injectable()
export class AppService {
  constructor(private config: RootConfig) {}

  getData(): {
    message: string;
    config: RootConfig;
  } {
    console.log('All config', this.config);
    return {
      message: 'Hello API',
      config: this.config,
    };
  }
}
