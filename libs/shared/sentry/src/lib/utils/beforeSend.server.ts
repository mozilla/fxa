/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { tagFxaName } from './tagFxaName';
import { InitSentryOpts } from '../models/SentryConfigOpts';
import { ErrorEvent } from '@sentry/core';

const EXPECTED_ERRORS = new Set([
  'PromotionCodePriceNotValidError',
  'PromotionCodeNotFoundError',
  'CouponErrorInvalidCode',
  'FinishErrorCartFailedError',
  'IntentCardDeclinedError',
  'IntentCardExpiredError',
  'IntentTryAgainError',
  'IntentGetInTouchError',
  'IntentInsufficientFundsError',
  'PayPalPaymentMethodError',
  'PayPalServiceUnavailableError',
]);

export const beforeSend = function (
  event: ErrorEvent,
  hint: any,
  config: InitSentryOpts
) {
  if (event.exception?.values) {
    for (const value of event.exception.values) {
      if (value.type && EXPECTED_ERRORS.has(value.type)) {
        return null;
      }
    }
  }

  event = tagFxaName(event, config.sentry?.serverName || 'unknown');

  config.eventFilters?.forEach((filter) => {
    event = filter(event, hint);
  });
  return event;
};
