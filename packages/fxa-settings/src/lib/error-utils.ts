/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GraphQLError } from 'graphql';
import {
  AuthUiError,
  AuthUiErrorNos,
  AuthUiErrors,
} from './auth-errors/auth-errors';
import VerificationMethods from '../constants/verification-methods';
import VerificationReasons from '../constants/verification-reasons';
import * as Sentry from '@sentry/browser';
import { FtlMsgResolver } from 'fxa-react/lib/utils';
import { OAUTH_ERRORS } from './oauth';

// TODO: Consolidate with AuthUiError type
export interface GenericError {
  errno: number;
  message: string;
  /** Not typically used in the UI, prefer 'errno' instead */
  code?: number;
  retryAfter?: number;
  retryAfterLocalized?: string;
}

export type BeginSigninError = GenericError & {
  verificationReason?: VerificationReasons;
  verificationMethod?: VerificationMethods;
  /** Important for 'Incorrect email case' edgecase */
  email?: string;
};

export type HandledError = GenericError | BeginSigninError;

const handleAuthUiError = (error: {
  errno: number;
  message: string;
}): { error: HandledError } => {
  const { errno } = error as HandledError;
  if (errno && AuthUiErrorNos[errno]) {
    return { error };
  }
  return { error: AuthUiErrors.UNEXPECTED_ERROR as HandledError };
};

export const getHandledError = (error: {
  errno: number;
  message: string;
  graphQLErrors?: GraphQLError[];
}) => {
  const graphQLError: GraphQLError | undefined = error.graphQLErrors?.[0];
  if (graphQLError) {
    return handleGQLError(graphQLError);
  }
  return handleAuthUiError(error);
};

const handleGQLError = (graphQLError: GraphQLError) => {
  const errno = graphQLError.extensions.errno as number;

  if (errno && AuthUiErrorNos[errno]) {
    const uiError = {
      message: AuthUiErrorNos[errno].message,
      errno,
      email:
        errno === AuthUiErrors.INCORRECT_EMAIL_CASE.errno
          ? graphQLError.extensions.email
          : undefined,
      verificationMethod:
        (graphQLError.extensions.verificationMethod as VerificationMethods) ||
        undefined,
      verificationReason:
        (graphQLError.extensions.verificationReason as VerificationReasons) ||
        undefined,
      retryAfter: (graphQLError.extensions.retryAfter as number) || undefined,
      retryAfterLocalized:
        (graphQLError.extensions.retryAfterLocalized as string) || undefined,
    };
    return { error: uiError as HandledError };
  }

  // if not a graphQLError or if no localizable message available for error
  return { error: AuthUiErrors.UNEXPECTED_ERROR as HandledError };
};

/**
 * Utility function to retrieve the localized auth client error message
 * - works for throttling errors that include a localized retry after value
 * - returns an unexpected error if the error is unknown or does not have a localized message
 * @param ftlMsgResolver
 * @param err is an AuthClient error
 * @returns
 */
export const getLocalizedErrorMessage = (
  ftlMsgResolver: FtlMsgResolver,
  error: AuthUiError | HandledError
) => {
  if (error.errno) {
    if (AuthUiErrorNos[error.errno]) {
      if (
        error.retryAfterLocalized &&
        error.errno === AuthUiErrors.THROTTLED.errno
      ) {
        // For throttling errors where a localized retry after value is provided
        return ftlMsgResolver.getMsg(
          getErrorFtlId(error),
          AuthUiErrorNos[error.errno].message,
          { retryAfter: error.retryAfterLocalized }
        );
      } else if (error.errno === AuthUiErrors.THROTTLED.errno) {
        // For throttling errors where a localized retry after value is not available
        return ftlMsgResolver.getMsg(
          'auth-error-114-generic',
          AuthUiErrorNos[114].message
        );
      } else {
        // for all other recognized auth UI errors
        return ftlMsgResolver.getMsg(
          getErrorFtlId(error),
          AuthUiErrorNos[error.errno].message
        );
      }
    }
    const oAuthError = Object.values(OAUTH_ERRORS).find(
      (oAuthErr) => error.errno === oAuthErr.errno
    );
    if (oAuthError) {
      return ftlMsgResolver.getMsg(
        getErrorFtlId(oAuthError),
        oAuthError.message
      );
    }
  }

  const unexpectedError = AuthUiErrors.UNEXPECTED_ERROR;
  return ftlMsgResolver.getMsg(
    getErrorFtlId(unexpectedError),
    unexpectedError.message
  );
};

/*
  TODO in FXA-9502: account for potential errno overlap between auth-errors
  and oauth errors. Checking the auth-error array currently happens first.
**/
export const getErrorFtlId = (err: { errno?: number; message?: string }) => {
  if (err.errno) {
    if (err.errno in AuthUiErrorNos) {
      const error = AuthUiErrorNos[err.errno];
      return `auth-error-${err.errno}${
        error.version ? '-' + error.version : ''
      }`;
    }

    const oAuthError = Object.values(OAUTH_ERRORS).find(
      (oAuthErr) => err.errno === oAuthErr.errno
    );
    if (oAuthError) {
      return `oauth-error-${err.errno}${
        oAuthError.version ? '-' + oAuthError.version : ''
      }`;
    }
  }
  // If the error isn't found, return an empty string FTL ID and log to Sentry.
  const logMessage = err.errno
    ? `WARNING: An error occurred that we attempted to localize and render, but this error was not found in auth-errors or oauth-errors. We should either add this error to our list or not display it. error: ${JSON.stringify(
        err
      )}`
    : `WARNING: An error occurred that we attempted to localize and render, but 'errno' is missing. error: ${JSON.stringify(
        err
      )}`;
  Sentry.captureMessage(logMessage);
  return '';
};
