/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  AppleSubscription,
  GooglePlaySubscription,
  IapSubscription,
  MozillaSubscription,
  MozillaSubscriptionTypes,
  WebSubscription,
} from './types';

export const isWebSubscription = (
  s: MozillaSubscription
): s is WebSubscription =>
  s._subscription_type === MozillaSubscriptionTypes.WEB;

export const isIapSubscription = (
  s: MozillaSubscription
): s is IapSubscription =>
  isGooglePlaySubscription(s) || isAppleSubscription(s);

export const isGooglePlaySubscription = (
  s: MozillaSubscription
): s is GooglePlaySubscription =>
  s._subscription_type === MozillaSubscriptionTypes.IAP_GOOGLE;

export const isAppleSubscription = (
  s: MozillaSubscription
): s is AppleSubscription =>
  s._subscription_type === MozillaSubscriptionTypes.IAP_APPLE;
