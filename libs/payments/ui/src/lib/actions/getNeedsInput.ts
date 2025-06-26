/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { getApp } from '../nestapp/app';
import * as Sentry from '@sentry/nextjs';
import { revalidatePath } from 'next/cache';

export const getNeedsInputAction = async (
  cartId: string
) => {
  try {
    const inputNeeded = await getApp().getActionsService().getNeedsInput({ cartId });
    return inputNeeded;
  } catch (error) {
    Sentry.captureException(error);
    revalidatePath(
        `/[locale]/[offeringId]/[interval]/checkout/[cartId]/needs_input`,
        'page'
    );
    return;
  }

};
