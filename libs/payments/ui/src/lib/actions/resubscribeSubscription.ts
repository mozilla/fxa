/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { revalidatePath } from 'next/cache';
import { requireSessionUid } from '@fxa/payments/ui-auth';
import { getApp } from '../nestapp/app';

export const resubscribeSubscriptionAction = async (subscriptionId: string) => {
  const uid = await requireSessionUid();
  const result = await getApp().getActionsService().resubscribeSubscription({
    uid,
    subscriptionId,
  });

  revalidatePath(
    '/[locale]/subscriptions/[subscriptionId]/stay-subscribed',
    'page'
  );

  return result;
};
