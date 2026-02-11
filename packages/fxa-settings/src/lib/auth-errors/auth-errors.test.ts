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
  captureMessage: jest.fn(),
}));

describe('getErrorFtlId', () => {
  it('logs an informative error to sentry if passed an error with no errno', () => {
    getErrorFtlId(errorWithNoErrorNumber);
    const errorMessage = `WARNING: An error occurred that we attempted to localize and render, but 'errno' is missing. error: ${JSON.stringify(
      errorWithNoErrorNumber
    )}`;
    expect(Sentry.captureMessage).toHaveBeenCalledWith(errorMessage);
  });

  it('logs to sentry if an error does not match an entry in AuthUiErrors object or OAuth errors array', () => {
    getErrorFtlId(errorWithAnInvalidErrorNumber);
    const errorMessage = `WARNING: An error occurred that we attempted to localize and render, but this error was not found in auth-errors or oauth-errors. We should either add this error to our list or not display it. error: ${JSON.stringify(
      errorWithAnInvalidErrorNumber
    )}`;
    expect(Sentry.captureMessage).toHaveBeenCalledWith(errorMessage);
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
