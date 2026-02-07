import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor() {}

  getData() {
    return {
      message: 'Hello world',
    };
  }

  __heartbeat__() {
    return {};
  }

  __lbheartbeat__() {
    return {};
  }

  __version__() {
    return {
      version: '0.0.0',
    };
  }
}
