/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { apiSignupForNewsletter } from './apiClient';
import { config } from './config';
import { GeneralError } from './errors';
import sentry from './sentry';
export const FXA_NEWSLETTER_SIGNUP_ERROR: GeneralError = {
  code: 'fxa_newsletter_signup_error',
};

export async function handleNewsletterSignup() {
  try {
    await apiSignupForNewsletter({
      newsletters: [config.newsletterId],
    });
  } catch (e) {
    sentry.captureException(e);
    throw FXA_NEWSLETTER_SIGNUP_ERROR;
  }
}
