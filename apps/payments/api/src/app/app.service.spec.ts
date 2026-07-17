/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { AppService } from './app.service';

jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  const MOCK_VERSION_JSON = {
    version: {
      hash: 'abc123',
      version: '1.341.0',
      source: 'https://github.com/mozilla/fxa',
    },
  };
  return {
    ...actual,
    readFileSync: (filepath: string, encoding: string) => {
      if (filepath.endsWith('config/version.json')) {
        return JSON.stringify(MOCK_VERSION_JSON);
      }
      return actual.readFileSync(filepath, encoding);
    },
  };
});

describe('AppService', () => {
  let service: AppService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('service status endpoints', () => {
    it('__heartbeat__ should return empty object', () => {
      expect(service.__heartbeat__()).toEqual({});
    });

    it('__lbheartbeat__ should return empty object', () => {
      expect(service.__lbheartbeat__()).toEqual({});
    });

    it('__version__ should return version from package.json with commit and source from version.json', () => {
      expect(service.__version__()).toEqual({
        version: '0.0.0',
        commit: 'abc123',
        source: 'https://github.com/mozilla/fxa',
      });
    });
  });
});
