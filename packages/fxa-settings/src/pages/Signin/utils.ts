/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GraphQLError } from 'graphql';
import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import { BeginSigninError, NavigationOptions } from './interfaces';
import {
  AuthUiErrorNos,
  AuthUiErrors,
} from '../../lib/auth-errors/auth-errors';

export const getNavigationTarget = ({
  email,
  verificationReason,
  verificationMethod,
  verified,
  wantsTwoStepAuthentication,
}: NavigationOptions) => {
  // Note, all navigations are missing query params. Add these when working on
  // subsequent tickets.
  if (!verified) {
    // TODO: Does force password change ever reach here, or can we move
    // CHANGE_PASSWORD checks to another page?
    if (
      ((verificationReason === VerificationReasons.SIGN_IN ||
        verificationReason === VerificationReasons.CHANGE_PASSWORD) &&
        verificationMethod === VerificationMethods.TOTP_2FA) ||
      wantsTwoStepAuthentication
    ) {
      // TODO with signin_totp_code ticket, content server says this (double check it):
      // Login requests that ask for 2FA but don't have it setup on their account
      // will return an error.
      return {
        to: '/signin_totp_code',
        state: { verificationReason, verificationMethod },
      };
    } else if (verificationReason === VerificationReasons.SIGN_UP) {
      // do we need this?
      // if (verificationMethod !== VerificationMethods.EMAIL_OTP) {
      //  send email verification since this screen doesn't do it automatically
      // }
      return { to: '/confirm_signup_code' };
    } else {
      // TODO: Pretty sure we want this to be the default. The check used to be:
      // if (
      //   verificationMethod === VerificationMethods.EMAIL_OTP &&
      //   (verificationReason === VerificationReasons.SIGN_IN || verificationReason === VerificationReasons.CHANGE_PASSWORD)) {
      return {
        to: '/signin_token_code',
        state: {
          email,
          // TODO: FXA-9177 We may want to store this in local apollo cache
          // instead of passing it via location state, depending on
          // if we reference it in another spot or two and if we need
          // some action to happen dependent on it that should occur
          // without first reaching /signin.
          verificationReason,
        },
      };
    }
    // Verified account, but session hasn't been verified
  }
  return { to: '/settings' };
};

export const handleGQLError = (error: any) => {
  const graphQLError: GraphQLError = error.graphQLErrors?.[0];
  const errno = graphQLError?.extensions?.errno as number;

  if (errno && AuthUiErrorNos[errno]) {
    const uiError = {
      message: AuthUiErrorNos[errno].message,
      errno,
      verificationMethod:
        (graphQLError.extensions.verificationMethod as VerificationMethods) ||
        undefined,
      verificationReason:
        (graphQLError.extensions.verificationReason as VerificationReasons) ||
        undefined,
      retryAfter: (graphQLError?.extensions?.retryAfter as number) || undefined,
      retryAfterLocalized:
        (graphQLError?.extensions?.retryAfterLocalized as string) || undefined,
    };
    return { error: uiError as BeginSigninError };
    // if not a graphQLError or if no localizable message available for error
  }

  return { error: AuthUiErrors.UNEXPECTED_ERROR as BeginSigninError };
};
