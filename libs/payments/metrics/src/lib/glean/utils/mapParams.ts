/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { SubplatInterval } from '@fxa/payments/customer';
import { normalizeGleanFalsyValues } from './normalizeGleanFalsyValues';

export function mapParams(params: Record<string, string>) {
  const offeringId = normalizeGleanFalsyValues(params['offeringId']);
  const interval = normalizeGleanFalsyValues(
    params['interval']
  ) as SubplatInterval;
  const cartId = normalizeGleanFalsyValues(params['cartId']);

  return {
    offeringId,
    interval,
    cartId,
  };
}
