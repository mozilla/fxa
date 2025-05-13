/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
import { SanitizeExceptions } from './sanitizeExceptionsDecorator';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  withScope: jest.fn((callback) => callback({ setExtra: jest.fn() })),
  captureException: jest.fn(),
}));

class SensitiveError extends Error {
  public subtype: string;
  constructor(message: string) {
    super(message);
    this.subtype = 'SensitiveError';
  }
}

class AcceptableError extends Error {
  public subtype: string;
  constructor(message: string) {
    super(message);
    this.subtype = 'AcceptableError';
  }
}

class MockService {
  @SanitizeExceptions({ allowlist: [AcceptableError] })
  throwSensitiveError() {
    throw new SensitiveError('Sensitive error');
  }

  @SanitizeExceptions({ allowlist: [AcceptableError] })
  async throwSensitiveErrorAsync() {
    throw new SensitiveError('Sensitive error');
  }

  @SanitizeExceptions({ allowlist: [AcceptableError] })
  throwAcceptableError() {
    throw new AcceptableError('Acceptable error');
  }

  @SanitizeExceptions({ allowlist: [AcceptableError] })
  async throwAcceptableErrorAsync() {
    throw new AcceptableError('Acceptable error');
  }
}

describe('SanitizeExceptions Decorator', () => {
  let service: MockService;
  let mockLogger: { error: jest.Mock; info: jest.Mock };

  beforeEach(async () => {
    mockLogger = {
      error: jest.fn(),
      info: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MockService,
        {
          provide: LOGGER_PROVIDER,
          useValue: mockLogger,
        },
        MockStatsDProvider
      ],
    }).compile();

    service = module.get<MockService>(MockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('synchronous methods', () => {
    it('should pass acceptable errors through', () => {
      expect(() => service.throwAcceptableError()).toThrow(AcceptableError);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error caught by SanitizeExceptions decorator in MockService.throwAcceptableError',
        expect.any(AcceptableError)
      );
    });

    it('should sanitize sensitive errors', () => {
      expect(() => service.throwSensitiveError()).toThrow(
        'Something went wrong'
      );
      expect(() => service.throwSensitiveError()).not.toThrow(SensitiveError);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error caught by SanitizeExceptions decorator in MockService.throwSensitiveError',
        expect.any(SensitiveError)
      );
    });
  });

  describe('asynchronous methods', () => {
    it('should pass acceptable errors through', async () => {
      await expect(service.throwAcceptableErrorAsync()).rejects.toThrow(
        AcceptableError
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error caught by SanitizeExceptions decorator in MockService.throwAcceptableErrorAsync',
        expect.any(AcceptableError)
      );
    });

    it('should sanitize sensitive errors', async () => {
      await expect(service.throwSensitiveErrorAsync()).rejects.toThrow(
        'Something went wrong'
      );
      await expect(service.throwSensitiveErrorAsync()).rejects.not.toThrow(
        SensitiveError
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error caught by SanitizeExceptions decorator in MockService.throwSensitiveErrorAsync',
        expect.any(SensitiveError)
      );
    });
  });
});
