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

  let response = undefined;
  let revalidate = true;
  try {
    await actionsService.updateCart({
      cartId,
      version,
      cartDetails: {
        couponCode,
      },
    });
  } catch (err) {
    revalidate = false;
    switch (err.name) {
      case 'CartVersionMismatchError':
        response = CouponErrorMessageType.Generic;
        revalidate = true;
        break;
      case 'CouponErrorCannotRedeem':
        response = CouponErrorMessageType.CannotRedeem;
        break;
      case 'CouponErrorExpired':
        response = CouponErrorMessageType.Expired;
        break;
      case 'CouponErrorGeneric':
        response = CouponErrorMessageType.Generic;
        break;
      case 'CouponErrorLimitReached':
        response = CouponErrorMessageType.LimitReached;
        break;
      case 'CouponErrorInvalid':
      default:
        response = CouponErrorMessageType.Invalid;
    }
  }

  if (revalidate) {
    revalidatePath(
      `/[locale]/[offeringId]/[interval]/checkout/[cartId]/start`,
      'page'
    );
  }

  return response;
};
