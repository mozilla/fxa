import { Controller, Get } from '@nestjs/common';

import { version } from '../version';

@Controller()
export class HealthController {
  @Get('__lbheartbeat__')
  lbheartbeat(): Record<string, any> {
    return {};
  }

  @Get('__heartbeat__')
  heartbeat(): Record<string, any> {
    return {};
  }

  @Get('__version__')
  versionData(): typeof version {
    return version;
  }
}
