/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  categorizeWebAuthnError,
  handleWebAuthnError,
  WebAuthnErrorCategory,
  WebAuthnErrorType,
  WebAuthnOperation,
} from './webauthn-errors';

function dom(name: string): DOMException {
  return new DOMException('test', name);
}

const OPERATIONS: WebAuthnOperation[] = ['registration', 'authentication'];

describe('categorizeWebAuthnError — user-action errors (no Sentry)', () => {
  const cases: [string, WebAuthnErrorType][] = [
    ['NotAllowedError', WebAuthnErrorType.NotAllowed],
    ['TimeoutError', WebAuthnErrorType.Timeout],
  ];

  describe.each(OPERATIONS)('operation: %s', (operation) => {
    test.each(cases)(
      '%s → UserAction, logToSentry false',
      (name, errorType) => {
        const result = categorizeWebAuthnError(dom(name), operation);
        expect(result.category).toBe(WebAuthnErrorCategory.UserAction);
        expect(result.errorType).toBe(errorType);
        expect(result.logToSentry).toBe(false);
        expect(result.userMessageKey).toContain(operation);
        expect(result.userMessageKey).toMatch(/passkey-.+-error-.+/);
      }
    );
  });

  it('returns distinct keys for registration vs authentication', () => {
    const reg = categorizeWebAuthnError(dom('NotAllowedError'), 'registration');
    const auth = categorizeWebAuthnError(
      dom('NotAllowedError'),
      'authentication'
    );
    expect(reg.userMessageKey).not.toBe(auth.userMessageKey);
    expect(reg.userMessageKey).toContain('registration');
    expect(auth.userMessageKey).toContain('authentication');
  });
});

describe('categorizeWebAuthnError — device/platform errors (no Sentry)', () => {
  const cases: [string, WebAuthnErrorType][] = [
    ['NotSupportedError', WebAuthnErrorType.NotSupported],
    ['SecurityError', WebAuthnErrorType.Security],
    ['InvalidStateError', WebAuthnErrorType.InvalidState],
    ['NotReadableError', WebAuthnErrorType.NotReadable],
  ];

  describe.each(OPERATIONS)('operation: %s', (operation) => {
    test.each(cases)(
      '%s → DevicePlatform, logToSentry false',
      (name, errorType) => {
        const result = categorizeWebAuthnError(dom(name), operation);
        expect(result.category).toBe(WebAuthnErrorCategory.DevicePlatform);
        expect(result.errorType).toBe(errorType);
        expect(result.logToSentry).toBe(false);
      }
    );
  });

  it('InvalidStateError has distinct registration key (credential already exists)', () => {
    const reg = categorizeWebAuthnError(
      dom('InvalidStateError'),
      'registration'
    );
    const auth = categorizeWebAuthnError(
      dom('InvalidStateError'),
      'authentication'
    );
    expect(reg.userMessageKey).toContain('registration');
    expect(auth.userMessageKey).toContain('authentication');
  });
});

describe('categorizeWebAuthnError — unexpected errors (Sentry enabled)', () => {
  const domCases: [string, WebAuthnErrorType][] = [
    ['ConstraintError', WebAuthnErrorType.Constraint],
    ['DataError', WebAuthnErrorType.Data],
    ['EncodingError', WebAuthnErrorType.Encoding],
    ['OperationError', WebAuthnErrorType.Operation],
    ['UnknownError', WebAuthnErrorType.Unknown],
  ];

  describe.each(OPERATIONS)('operation: %s', (operation) => {
    test.each(domCases)(
      '%s → Unexpected, logToSentry true',
      (name, errorType) => {
        const result = categorizeWebAuthnError(dom(name), operation);
        expect(result.category).toBe(WebAuthnErrorCategory.Unexpected);
        expect(result.errorType).toBe(errorType);
        expect(result.logToSentry).toBe(true);
      }
    );
  });

  test.each(OPERATIONS)('TypeError → Unexpected on %s', (operation) => {
    const result = categorizeWebAuthnError(
      new TypeError('bad options'),
      operation
    );
    expect(result.category).toBe(WebAuthnErrorCategory.Unexpected);
    expect(result.errorType).toBe(WebAuthnErrorType.Type);
    expect(result.logToSentry).toBe(true);
  });

  test.each(OPERATIONS)(
    'unrecognized DOMException → Unexpected on %s',
    (operation) => {
      const result = categorizeWebAuthnError(
        dom('SomeNewBrowserError'),
        operation
      );
      expect(result.category).toBe(WebAuthnErrorCategory.Unexpected);
      expect(result.errorType).toBe(WebAuthnErrorType.Unknown);
      expect(result.logToSentry).toBe(true);
      expect(result.userMessageKey).toContain(operation);
    }
  );

  it('ConstraintError has distinct registration key', () => {
    const reg = categorizeWebAuthnError(dom('ConstraintError'), 'registration');
    const auth = categorizeWebAuthnError(
      dom('ConstraintError'),
      'authentication'
    );
    expect(reg.userMessageKey).toContain('registration');
    expect(reg.userMessageKey).toContain('constraint');
    expect(auth.userMessageKey).toContain('unexpected');
  });
});

describe('categorizeWebAuthnError — non-DOMException inputs default to unexpected', () => {
  const inputs: unknown[] = [
    null,
    undefined,
    0,
    '',
    {},
    [],
    new Error('plain error'),
  ];

  test.each(inputs.map((v) => [String(v), v]))(
    '%s → Unexpected, logToSentry true',
    (_, input) => {
      expect(() =>
        categorizeWebAuthnError(input, 'authentication')
      ).not.toThrow();
      const result = categorizeWebAuthnError(input, 'authentication');
      expect(result.category).toBe(WebAuthnErrorCategory.Unexpected);
      expect(result.logToSentry).toBe(true);
    }
  );
});

describe('handleWebAuthnError', () => {
  it('calls captureException for unexpected errors', () => {
    const captureException = jest.fn();
    handleWebAuthnError(new TypeError('bad'), 'registration', captureException);
    expect(captureException).toHaveBeenCalledWith(expect.any(TypeError));
  });

  it('does not call captureException for user-action errors', () => {
    const captureException = jest.fn();
    handleWebAuthnError(
      dom('NotAllowedError'),
      'authentication',
      captureException
    );
    expect(captureException).not.toHaveBeenCalled();
  });

  it('does not call captureException for device/platform errors', () => {
    const captureException = jest.fn();
    handleWebAuthnError(
      dom('NotSupportedError'),
      'registration',
      captureException
    );
    expect(captureException).not.toHaveBeenCalled();
  });

  it('passes the original error to captureException, not the categorized result', () => {
    const captureException = jest.fn();
    const error = dom('ConstraintError');
    handleWebAuthnError(error, 'registration', captureException);
    expect(captureException).toHaveBeenCalledWith(error);
  });
});
