/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { revalidatePath } from 'next/cache';

import { getApp } from '../nestapp/app';
import { CouponErrorMessageType } from '../utils/error-ftl-messages';
import { hasClassname } from '@fxa/payments/ui/utils';
import {
  CouponErrorExpired,
  CouponErrorGeneric,
  CouponErrorLimitReached,
} from '@fxa/payments/customer';

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
    if (hasClassname(err, CouponErrorExpired)) {
      return CouponErrorMessageType.Expired;
    } else if (hasClassname(err, CouponErrorGeneric)) {
      return CouponErrorMessageType.Generic;
    } else if (hasClassname(err, CouponErrorLimitReached)) {
      return CouponErrorMessageType.LimitReached;
    } else {
      return CouponErrorMessageType.Invalid;
    }
  }

  revalidatePath(
    `/[locale]/[offeringId]/[interval]/checkout/[cartId]/start`,
    'page'
  );

  return;
};
