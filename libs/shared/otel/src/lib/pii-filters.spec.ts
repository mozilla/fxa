/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TracingPiiFilter, createPiiFilter } from './pii-filters';
import { ILogger } from '@fxa/shared/log';
import { PiiData } from '@fxa/shared/sentry-utils';

describe('TracingPiiFilter', () => {
  const mockLogger: ILogger = {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('filter', () => {
    it('should filter PII (db|http) attributes in the data', () => {
      const filter = new TracingPiiFilter(mockLogger);
      const data: PiiData = {
        attributes: {
          'db.email': 'test@test.test',
          'http.header': {
            ip: '0.0.0.0',
          },
          'non.pii.attribute': 'safe-data',
        },
      };
      const expectedFilteredData = {
        attributes: {
          'db.email': '[Filtered]',
          'http.header': {
            ip: '[Filtered]',
          },
          'non.pii.attribute': 'safe-data',
        },
      };

      const result = filter.filter(data);

      expect(result).toEqual(expectedFilteredData);
    });

    it('should not modify data outside of `attributes`', () => {
      const filter = new TracingPiiFilter(mockLogger);
      const data: PiiData = {
        // custom property on PiiData that TracingPiiFilter doesn't care about
        myAttributes: {
          'db.email': 'test@test.test',
        },
      };

      const result = filter.filter(data);

      if (result && typeof result !== 'string') {
        expect(result['myAttributes']['db.email']).toBe('test@test.test');
      }

      expect(result).toEqual(data);
    });

    it('should log and throw an error if filtering fails', () => {
      const filter = new TracingPiiFilter(mockLogger);
      const data: PiiData = {
        attributes: new Proxy(
          {},
          {
            // `filter` uses `Object.keys` to iterate over attributes, so we simulate
            // an error by throwing in the `ownKeys` trap.
            ownKeys() {
              throw new Error('Simulated access error');
            },
          }
        ),
      };

      expect(() => filter.filter(data)).toThrow('Simulated access error');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'pii-trace-filter',
        expect.any(Error)
      );
    });
  });
});

describe('createPiiFilter', () => {
  const mockLogger: ILogger = {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return undefined if enabled is false', () => {
    const result = createPiiFilter(false, mockLogger);
    expect(result).toBeUndefined();
  });

  it('should create and return a TracingPiiFilter instance if enabled is true', () => {
    const result = createPiiFilter(true, mockLogger);
    expect(result).toBeInstanceOf(TracingPiiFilter);
  });

  it('should return the same instance on subsequent calls', () => {
    const firstInstance = createPiiFilter(true, mockLogger);
    const secondInstance = createPiiFilter(true, mockLogger);
    expect(firstInstance).toBe(secondInstance);
  });
});
