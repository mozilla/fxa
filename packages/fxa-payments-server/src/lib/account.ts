/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  apiCreatePasswordlessAccount,
  updateAPIClientToken,
  MetricsContext,
} from './apiClient';
import { GeneralError } from './errors';
import sentry from './sentry';
export const FXA_SIGNUP_ERROR: GeneralError = {
  code: 'fxa_account_signup_error',
};

export async function handlePasswordlessSignUp({
  email,
  clientId,
  metricsContext,
}: {
  email: string;
  clientId: string;
  metricsContext?: MetricsContext;
}) {
  try {
    const { access_token: accessToken } = await apiCreatePasswordlessAccount({
      email,
      clientId,
      metricsContext,
    });
    updateAPIClientToken(accessToken);
  } catch (e) {
    sentry.captureException(e);
    throw FXA_SIGNUP_ERROR;
  }
}

export type PasswordlessSignupHandlerParam = Parameters<
  typeof handlePasswordlessSignUp
>[0];
