/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { getApp } from '../nestapp/app';
import { redirect } from 'next/navigation';
import { CheckoutFailedError } from '@fxa/payments/cart';

export const submitNeedsInputAndRedirectAction = async (cartId: string) => {
  try {
    await getApp().getActionsService().submitNeedsInput({ cartId });
    redirect('success');
  } catch (error) {
    console.error('Error submitting needs input', error);
    if (error instanceof CheckoutFailedError) {
      redirect('error');
    } else {
      throw error;
    }
  }
};
