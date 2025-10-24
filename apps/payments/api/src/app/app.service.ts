import { Injectable } from '@nestjs/common';
import { RootConfig, TestNestedConfig } from '../config';

@Injectable()
export class AppService {
  constructor(
    private config: RootConfig,
    private nestedConfig: TestNestedConfig
  ) {}

  getData(): {
    message: string;
    config: RootConfig;
    nestedConfigOnly: TestNestedConfig;
  } {
    console.log('All config', this.config);
    console.log('Nested only', this.nestedConfig);
    return {
      message: 'Hello API',
      config: this.config,
      nestedConfigOnly: this.nestedConfig,
    };
  }
}
