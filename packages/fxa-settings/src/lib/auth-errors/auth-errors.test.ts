/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  composeAuthUiErrorTranslationId,
  AuthUiErrorNos,
  AuthUiError,
} from './auth-errors';
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

describe('composeAuthUIErrorTranslationId', () => {
  it('logs an informative error to sentry if passed an error with no errno', () => {
    composeAuthUiErrorTranslationId(errorWithNoErrorNumber);
    const errorMessage = `composeAuthUiErrorTranslationId: No error number given, unable to create a localization ID for AuthUiError string. error: ${JSON.stringify(
      errorWithNoErrorNumber
    )}`;
    expect(Sentry.captureMessage).toHaveBeenCalledWith(errorMessage);
  });

  it('logs an informative error to sentry if passed an error which does not match an entry in the AuthUiErrors object', () => {
    composeAuthUiErrorTranslationId(errorWithAnInvalidErrorNumber);
    const errorMessage = `composeAuthUiErrorTranslationId: There is no matching error in AuthUiErrors. error: ${JSON.stringify(
      errorWithAnInvalidErrorNumber
    )}`;
    expect(Sentry.captureMessage).toHaveBeenCalledWith(errorMessage);
  });

  it('returns an empty string if passed no error number', () => {
    expect(composeAuthUiErrorTranslationId(errorWithNoErrorNumber)).toEqual('');
  });

  it('returns an empty string when given an error number with no corresponding error in the AuthUiError object', () => {
    // First we just check that this has not become a valid AuthUiError number, for the sake of future clarity.
    expect(AuthUiErrorNos[notAnExistingErrorNumber]).toBeUndefined();
    // Then we actually test the behavior.
    expect(
      composeAuthUiErrorTranslationId(errorWithAnInvalidErrorNumber)
    ).toEqual('');
  });

  it('correctly forms and returns a translation id for an auth ui error string which has never been updated (has no version number)', () => {
    const validErrorNo = 106;
    // First we just make sure that this is still a valid UI error.
    expect(AuthUiErrorNos[validErrorNo]).toBeDefined();
    // Then we make sure that it doesn't have a version number. This is a safeguard against the test unknowingly being outdated.
    expect(AuthUiErrorNos[validErrorNo].version).toBeUndefined();
    // The we actually test the functionality.
    const expectedStringId = 'auth-error-106';
    const stringId = composeAuthUiErrorTranslationId({
      message: 'I am a valid error with a valid error number',
      errno: validErrorNo,
    });
    expect(stringId).toEqual(expectedStringId);
  });

  it('correctly forms and returns a translation id for an auth ui error string which HAS been updated (has a version number', () => {
    const errnoWithVersion = 105;
    // First we just make sure that this is still a valid UI error.
    expect(AuthUiErrorNos[errnoWithVersion]).toBeDefined();
    // Then we make sure that it has a version number. This is a safeguard against the test unknowingly being outdated.
    expect(AuthUiErrorNos[errnoWithVersion].version).toBeDefined();
    // The we actually test the functionality.
    const expectedStringId = `auth-error-105-${AuthUiErrorNos[errnoWithVersion].version}`;
    const stringId = composeAuthUiErrorTranslationId({
      message: 'This is a valid error, with a string that has a version number',
      errno: errnoWithVersion,
    });
    expect(stringId).toEqual(expectedStringId);
  });
});
