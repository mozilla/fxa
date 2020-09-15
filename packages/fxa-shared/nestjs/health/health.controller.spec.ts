/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test, TestingModule } from '@nestjs/testing';

import { getVersionInfo } from '../version';
import { HEALTH_CONFIG } from './health.constants';
import { HealthController } from './health.controller';

const version = getVersionInfo(__dirname);

describe('Health Controller', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HEALTH_CONFIG, useValue: { version } }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return heartbeat', async () => {
    expect(await controller.heartbeat()).toStrictEqual({});
  });

  it('should return lbheartbeat', () => {
    expect(controller.lbheartbeat()).toStrictEqual({});
  });

  it('should return the version', () => {
    const source = controller.versionData().source;
    expect(source).toBe(version.source);
  });
});
