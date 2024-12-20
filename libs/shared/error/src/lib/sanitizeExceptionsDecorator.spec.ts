/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SanitizeExceptions } from './sanitizeExceptionsDecorator';

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

@SanitizeExceptions({ allowlist: [AcceptableError] })
class MockClass {
  constructor() {}
  asyncTest() {
    return Promise.resolve();
  }

  throwSensitiveError() {
    throw new SensitiveError('Sensitive error');
  }

  async throwSensitiveErrorAsync() {
    throw new SensitiveError('Sensitive error');
  }

  throwAcceptableError() {
    throw new AcceptableError('Acceptable error');
  }

  async throwAcceptableErrorAsync() {
    throw new AcceptableError('Acceptable error');
  }
}

describe('GenericError', () => {
  describe('synchronous methods', () => {
    it('should pass acceptable errors', () => {
      const mock = new MockClass();
      expect(mock.throwAcceptableError).toThrowError(AcceptableError);
    });
    it('should catch sensitive errors', () => {
      const mock = new MockClass();
      expect(mock.throwSensitiveError).not.toThrowError(SensitiveError);
      expect(mock.throwSensitiveError).toThrowError(Error);
    });
  });
  describe('asynchronous methods', () => {
    it('should pass acceptable errors', async () => {
      console.log('should pass acceptable errors');
      const mock = new MockClass();
      await expect(mock.throwAcceptableErrorAsync).rejects.toThrowError(
        AcceptableError
      );
    });
    it('should catch sensitive errors', async () => {
      const mock = new MockClass();
      await expect(mock.throwSensitiveErrorAsync()).rejects.not.toThrowError(
        SensitiveError
      );
      await expect(mock.throwSensitiveErrorAsync()).rejects.toThrowError(Error);
    });
  });
});
