/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { getApp } from '../nestapp/app';
import { redirect } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';
import { revalidatePath } from 'next/cache';

export const submitNeedsInputAndRedirectAction = async (cartId: string) => {
  let redirectPath: string | undefined;
  try {
    await getApp().getActionsService().submitNeedsInput({ cartId });
    redirectPath = 'success';
  } catch (error) {
    console.error('Error submitting needs input', error);
    Sentry.captureException(error);
    console.log('in submitNeedsInputAndRedirect, catch');
    revalidatePath(
        `/[locale]/[offeringId]/[interval]/checkout/[cartId]/needs_input`,
        'page'
    );
   redirectPath = 'error';
  }

  redirect(redirectPath);
};
