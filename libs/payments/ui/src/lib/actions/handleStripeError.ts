/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { StripeError } from '@stripe/stripe-js';
import { app } from '../nestapp/app';
import { redirect } from 'next/navigation';
import { stripeErrorToErrorReasonId } from '@fxa/payments/cart';

export const handleStripeErrorAction = async (
  cartId: string,
  stripeError: StripeError
) => {
  const errorReasonId = stripeErrorToErrorReasonId(stripeError);

  await app.getActionsService().finalizeCartWithError({
    cartId,
    errorReasonId,
  });

  redirect('error');
};
