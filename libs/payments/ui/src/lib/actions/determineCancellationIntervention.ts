/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { getApp } from '../nestapp/app';

export const determineCancellationInterventionAction = async (args: {
  uid: string;
  subscriptionId: string;
  acceptLanguage?: string | null;
  selectedLanguage?: string;
}) => {
  return await getApp().getActionsService().determineCancellationIntervention({
    uid: args.uid,
    subscriptionId: args.subscriptionId,
    acceptLanguage: args.acceptLanguage,
    selectedLanguage: args.selectedLanguage,
  });
};
