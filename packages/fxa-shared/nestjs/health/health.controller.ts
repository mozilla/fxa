/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Controller, Get, Inject } from '@nestjs/common';

import { Version } from '../version';
import { HEALTH_CONFIG } from './health.constants';
import { HealthControllerConfigParams } from './health.module';

@Controller()
export class HealthController {
  constructor(
    @Inject(HEALTH_CONFIG) private config: HealthControllerConfigParams
  ) {}

  @Get('__lbheartbeat__')
  lbheartbeat(): Record<string, any> {
    return {};
  }

  @Get('__heartbeat__')
  async heartbeat(): Promise<Record<string, any>> {
    if (this.config.extraHealthData) {
      return this.config.extraHealthData();
    }
    return {};
  }

  @Get('__version__')
  versionData(): Version {
    return this.config.version;
  }
}
