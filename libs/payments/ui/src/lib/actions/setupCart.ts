/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use server';

import { getApp } from '../nestapp/app';
import type { SubplatInterval } from '@fxa/payments/customer';

export const setupCartAction = async (
  interval: SubplatInterval,
  offeringConfigId: string,
  experiment?: string,
  promoCode?: string,
  uid?: string,
  ip?: string
) => {
  return getApp().getActionsService().setupCart({
    interval,
    offeringConfigId,
    experiment,
    promoCode,
    uid,
    ip,
  });
};
