/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type ProviderType = 'paypal' | 'stripe' | 'not_chosen';

export function isStripe(provider: ProviderType | undefined): boolean {
  return provider === 'stripe';
}

export function isPaypal(provider: ProviderType | undefined): boolean {
  return provider === 'paypal';
}

export function isNotChosen(provider: ProviderType | undefined): boolean {
  return provider === 'not_chosen' || provider === undefined;
}
