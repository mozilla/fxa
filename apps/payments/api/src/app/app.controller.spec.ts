/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const MOCK_VERSION = {
  version: '1.341.0',
  commit: 'abc123',
  source: 'https://github.com/mozilla/fxa',
};

describe('AppController', () => {
  let appController: AppController;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            __heartbeat__: () => ({}),
            __lbheartbeat__: () => ({}),
            __version__: () => MOCK_VERSION,
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('service status endpoints', () => {
    it('__heartbeat__ should return empty object', () => {
      expect(appController.__heartbeat__()).toEqual({});
    });

    it('__lbheartbeat__ should return empty object', () => {
      expect(appController.__lbheartbeat__()).toEqual({});
    });

    it('__version__ should return version info', () => {
      expect(appController.__version__()).toEqual(MOCK_VERSION);
    });
  });
});
