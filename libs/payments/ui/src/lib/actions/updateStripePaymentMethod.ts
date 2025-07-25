/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { getApp } from '../nestapp/app';

export const updateStripePaymentMethod = async (
  uid: string,
  confirmationTokenId: string
) => {
  const actionsService = getApp().getActionsService();

  return await actionsService.updateStripePaymentMethods({
    uid,
    confirmationTokenId,
  });
};
