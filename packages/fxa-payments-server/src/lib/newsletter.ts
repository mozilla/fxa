/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ProductMetadata } from 'fxa-shared/subscriptions/types';
import { apiSignupForNewsletter } from './apiClient';
import { GeneralError } from './errors';
import sentry from './sentry';
export const FXA_NEWSLETTER_SIGNUP_ERROR: GeneralError = {
  code: 'fxa_newsletter_signup_error',
};
const DEFAULT_NEWSLETTER_SLUG = 'mozilla-and-you';

export async function handleNewsletterSignup(
  productMetadata?: ProductMetadata
) {
  const newsletterSlugs: string[] = productMetadata?.newsletterSlug
    ? productMetadata?.newsletterSlug.split(',')
    : [DEFAULT_NEWSLETTER_SLUG];

  try {
    await apiSignupForNewsletter({
      newsletters: newsletterSlugs,
    });
  } catch (e) {
    sentry.captureException(e);
    throw FXA_NEWSLETTER_SIGNUP_ERROR;
  }
}
