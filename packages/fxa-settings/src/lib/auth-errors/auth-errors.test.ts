/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getErrorFtlId } from '../error-utils';
import { OAUTH_ERRORS } from '../oauth';
import { AuthUiErrorNos, AuthUiError } from './auth-errors';
import * as Sentry from '@sentry/browser';

const notAnExistingErrorNumber = 100000;
const errorWithNoErrorNumber = {
  message: "I'm an error with no error number!",
} as AuthUiError;
const errorWithAnInvalidErrorNumber = {
  errno: notAnExistingErrorNumber,
  message: 'This is an error with an invalid errno!',
} as AuthUiError;

jest.mock('@sentry/browser', () => ({
  captureException: jest.fn(),
}));

const missingErrnoReason =
  "An error occurred that we attempted to localize and render, but 'errno' is missing.";
const unknownErrnoReason =
  'An error occurred that we attempted to localize and render, but this error was not found in auth-errors or oauth-errors. We should either add this error to our list or not display it.';

const capturedException = () => {
  const [error, context] = (
    Sentry.captureException as jest.MockedFunction<
      typeof Sentry.captureException
    >
  ).mock.calls[0];
  return { error: error as Error, context };
};

describe('getErrorFtlId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs an informative error to sentry if passed an error with no errno', () => {
    getErrorFtlId(errorWithNoErrorNumber);
    const { error, context } = capturedException();
    expect(error.message).toEqual("I'm an error with no error number!");
    expect(context).toEqual({
      tags: { source: 'getErrorFtlId' },
      extra: {
        reason: missingErrnoReason,
        errno: undefined,
        code: undefined,
        retryAfter: undefined,
      },
      level: 'warning',
    });
  });

  it('logs to sentry if an error does not match an entry in AuthUiErrors object or OAuth errors array', () => {
    getErrorFtlId(errorWithAnInvalidErrorNumber);
    const { error, context } = capturedException();
    expect(error.message).toEqual('This is an error with an invalid errno!');
    expect(context).toEqual({
      tags: { source: 'getErrorFtlId' },
      extra: {
        reason: unknownErrnoReason,
        errno: notAnExistingErrorNumber,
        code: undefined,
        retryAfter: undefined,
      },
      level: 'warning',
    });
  });

  it('sends the code and retryAfter of an unrecognized error to sentry', () => {
    getErrorFtlId({
      errno: notAnExistingErrorNumber,
      message: 'This is a rate limited error with an invalid errno!',
      code: 429,
      retryAfter: 900,
    });
    const { context } = capturedException();
    expect(context).toEqual({
      tags: { source: 'getErrorFtlId' },
      extra: {
        reason: unknownErrnoReason,
        errno: notAnExistingErrorNumber,
        code: 429,
        retryAfter: 900,
      },
      level: 'warning',
    });
  });

  it('sends a real Error with no errno to sentry with its message and stack intact', () => {
    const err = new Error('A real Error with no errno');
    getErrorFtlId(err);
    const { error } = capturedException();
    expect(error).toBe(err);
    expect(error.message).toEqual('A real Error with no errno');
  });

  it('sends a real Error with an unrecognized errno to sentry with its message and stack intact', () => {
    const err = Object.assign(new Error('A real Error with an invalid errno'), {
      errno: notAnExistingErrorNumber,
    });
    getErrorFtlId(err);
    const { error, context } = capturedException();
    expect(error).toBe(err);
    expect(error.message).toEqual('A real Error with an invalid errno');
    expect(context).toEqual({
      tags: { source: 'getErrorFtlId' },
      extra: {
        reason: unknownErrnoReason,
        errno: notAnExistingErrorNumber,
        code: undefined,
        retryAfter: undefined,
      },
      level: 'warning',
    });
  });

  it('falls back to the reason when the error carries no message', () => {
    getErrorFtlId({});
    const { error } = capturedException();
    expect(error.message).toEqual(missingErrnoReason);
  });

  it('does not log to sentry for a known errno', () => {
    getErrorFtlId({ message: 'I am valid', errno: 106 });
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('returns an empty string if passed no error number', () => {
    expect(getErrorFtlId(errorWithNoErrorNumber)).toEqual('');
  });

  it('returns an empty string when given an invalid errno', () => {
    // First we just check that this has not become a valid AuthUiError number, for the sake of future clarity.
    expect(AuthUiErrorNos[notAnExistingErrorNumber]).toBeUndefined();
    expect(
      Object.values(OAUTH_ERRORS).find(
        (oAuthErr) => notAnExistingErrorNumber === oAuthErr.errno
      )
    ).toBeUndefined();
    // Then we actually test the behavior.
    expect(getErrorFtlId(errorWithAnInvalidErrorNumber)).toEqual('');
  });

  it('correctly returns an FTL ID for an auth error without a version number', () => {
    const validErrorNo = 106;
    // First we just make sure that this is still a valid UI error.
    expect(AuthUiErrorNos[validErrorNo]).toBeDefined();
    // Then we make sure that it doesn't have a version number. This is a safeguard against the test unknowingly being outdated.
    expect(AuthUiErrorNos[validErrorNo].version).toBeUndefined();
    // The we actually test the functionality.
    const expectedStringId = 'auth-error-106';
    const stringId = getErrorFtlId({
      message: 'I am a valid error with a valid error number',
      errno: validErrorNo,
    });
    expect(stringId).toEqual(expectedStringId);
  });

  it('correctly returns an FTL ID for an auth error with a version number', () => {
    const errnoWithVersion = 105;
    // First we just make sure that this is still a valid UI error.
    expect(AuthUiErrorNos[errnoWithVersion]).toBeDefined();
    // Then we make sure that it has a version number. This is a safeguard against the test unknowingly being outdated.
    expect(AuthUiErrorNos[errnoWithVersion].version).toBeDefined();
    // The we actually test the functionality.
    const expectedStringId = `auth-error-105-${AuthUiErrorNos[errnoWithVersion].version}`;
    const stringId = getErrorFtlId({
      message: 'This is a valid error, with a string that has a version number',
      errno: errnoWithVersion,
    });
    expect(stringId).toEqual(expectedStringId);
  });

  it('returns the FTL ID for the passkey user-verification-required error (errno 233)', () => {
    expect(AuthUiErrorNos[233]).toBeDefined();
    expect(AuthUiErrorNos[233].version).toBeUndefined();
    const stringId = getErrorFtlId({
      message: AuthUiErrorNos[233].message,
      errno: 233,
    });
    expect(stringId).toEqual('auth-error-233');
  });

  it('correctly returns an FTL ID for an OAuth error', () => {
    const validErrorNo = 1000;
    // Ensure this errno is still valid before testing
    expect(
      Object.values(OAUTH_ERRORS).find(
        (oAuthErr) => validErrorNo === oAuthErr.errno
      )
    ).toBeDefined();
    const expectedStringId = 'oauth-error-1000';
    const stringId = getErrorFtlId({
      message: 'I am valid',
      errno: validErrorNo,
    });
    expect(stringId).toEqual(expectedStringId);
  });
});
