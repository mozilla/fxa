/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { revalidatePath } from 'next/cache';
import { getApp } from '../nestapp/app';
import { CouponErrorMessageType } from '../utils/error-ftl-messages';

export const applyCouponAction = async (
  cartId: string,
  version: number,
  couponCode?: string
) => {
  const actionsService = getApp().getActionsService();

  try {
    await actionsService.updateCart({
      cartId,
      version,
      cartDetails: {
        couponCode,
      },
    });
  } catch (err) {
    switch (err.name) {
      case 'CouponErrorCannotRedeem':
        return CouponErrorMessageType.CannotRedeem;
      case 'CouponErrorExpired':
        return CouponErrorMessageType.Expired;
      case 'CouponErrorGeneric':
        return CouponErrorMessageType.Generic;
      case 'CouponErrorLimitReached':
        return CouponErrorMessageType.LimitReached;
      case 'CouponErrorInvalid':
      default:
        return CouponErrorMessageType.Invalid;
    }
  }

  revalidatePath(
    `/[locale]/[offeringId]/[interval]/checkout/[cartId]/start`,
    'page'
  );

  return;
};
