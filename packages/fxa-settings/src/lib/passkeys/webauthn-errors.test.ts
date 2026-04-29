/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs from 'fs';
import path from 'path';
import {
  categorizeWebAuthnError,
  ERROR_MAP,
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
        expect(result.ftlId).toContain(operation);
        expect(result.ftlId).toMatch(/passkey-.+-error-.+/);
        expect(result.fallbackText).toMatch(/passkey/i);
      }
    );
  });

  it('returns distinct keys for registration vs authentication', () => {
    const reg = categorizeWebAuthnError(dom('NotAllowedError'), 'registration');
    const auth = categorizeWebAuthnError(
      dom('NotAllowedError'),
      'authentication'
    );
    expect(reg.ftlId).not.toBe(auth.ftlId);
    expect(reg.ftlId).toContain('registration');
    expect(auth.ftlId).toContain('authentication');
    expect(reg.fallbackText).not.toBe(auth.fallbackText);
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
        expect(result.fallbackText.length).toBeGreaterThan(0);
        expect(result.fallbackText).toMatch(
          /passkey|authenticator|secure site/i
        );
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
    expect(reg.ftlId).toContain('registration');
    expect(auth.ftlId).toContain('authentication');
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
      expect(result.ftlId).toContain(operation);
      expect(result.fallbackText).toMatch(/try|went wrong/i);
    }
  );

  it('ConstraintError has distinct registration key', () => {
    const reg = categorizeWebAuthnError(dom('ConstraintError'), 'registration');
    const auth = categorizeWebAuthnError(
      dom('ConstraintError'),
      'authentication'
    );
    expect(reg.ftlId).toContain('registration');
    expect(reg.ftlId).toContain('constraint');
    expect(auth.ftlId).toContain('unexpected');
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

describe('fallbackText matches FTL strings', () => {
  const ftlPath = path.resolve(__dirname, 'en.ftl');
  const ftlContent = fs.readFileSync(ftlPath, 'utf-8');

  const ftlMessages = new Map<string, string>();
  for (const line of ftlContent.split('\n')) {
    const match = line.match(
      /^(passkey-(?:registration|authentication)-error-\S+)\s*=\s*(.+)$/
    );
    if (match) {
      ftlMessages.set(match[1], match[2].trim());
    }
  }

  const entries = Object.entries(ERROR_MAP);

  describe.each(OPERATIONS)('operation: %s', (operation) => {
    test.each(entries)('%s fallbackText matches FTL', (_, entry) => {
      const ftlValue = ftlMessages.get(entry.ftlId[operation]);
      expect(ftlValue).toBeDefined();
      expect(entry.fallbackText[operation]).toBe(ftlValue);
    });
  });
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

  it('forwards ceremony context to categorization (duplicate-authenticator message)', () => {
    const captureException = jest.fn();
    const result = handleWebAuthnError(
      dom('NotAllowedError'),
      'registration',
      captureException,
      { hadExcludeCredentials: true }
    );
    expect(result.ftlId).toBe(
      'passkey-registration-error-not-allowed-existing'
    );
  });
});
