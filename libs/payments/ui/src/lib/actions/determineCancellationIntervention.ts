/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { getApp } from '../nestapp/app';
import { SubplatInterval } from '@fxa/payments/customer';

export const determineCancellationInterventionAction = async (args: {
    uid: string,
    customerId: string,
    subscriptionId: string,
    offeringApiIdentifier: string,
    currentInterval: SubplatInterval,
    upgradeInterval: SubplatInterval,
    acceptLanguage?: string | null,
    selectedLanguage?: string,
}) => {
  return await getApp().getActionsService().determineCancellationIntervention({
    uid: args.uid,
    customerId: args.customerId,
    subscriptionId: args.subscriptionId,
    offeringApiIdentifier: args.offeringApiIdentifier,
    currentInterval: args.currentInterval,
    upgradeInterval: args.upgradeInterval,
    acceptLanguage: args.acceptLanguage,
    selectedLanguage: args.selectedLanguage,
  });
};
