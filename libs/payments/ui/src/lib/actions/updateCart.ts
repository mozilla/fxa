/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { revalidatePath } from 'next/cache';

import { UpdateCartInput } from '@fxa/payments/cart';
import { getApp } from '../nestapp/app';
import { CouponErrorMessageType } from '../utils/error-ftl-messages';

export const updateCartAction = async (
  cartId: string,
  version: number,
  cartDetails: UpdateCartInput
) => {
  const actionsService = getApp().getActionsService();

  try {
    await actionsService.updateCart({
      cartId,
      version,
      cartDetails,
    });
  } catch (err) {
    if (err.name === 'CouponErrorExpired') {
      return CouponErrorMessageType.Expired;
    } else if (err.name === 'CouponErrorGeneric') {
      return CouponErrorMessageType.Generic;
    } else if (err.name === 'CouponErrorLimitReached') {
      return CouponErrorMessageType.LimitReached;
    } else {
      return CouponErrorMessageType.Invalid;
    }
  }

  revalidatePath(
    '/[locale]/[offeringId]/[interval]/checkout/[cartId]/start',
    'page'
  );

  return;
};
