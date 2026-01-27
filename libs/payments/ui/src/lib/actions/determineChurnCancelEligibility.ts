/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { getApp } from '../nestapp/app';

export const determineChurnCancelEligibilityAction = async (
  uid: string,
  subscriptionId: string,
  acceptLanguage?: string | null,
  selectedLanguage?: string
) => {
  return await getApp().getActionsService().determineChurnCancelEligibility({
    uid,
    subscriptionId,
    acceptLanguage,
    selectedLanguage,
  });
};
