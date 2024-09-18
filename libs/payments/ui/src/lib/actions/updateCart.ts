/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { plainToClass } from 'class-transformer';
import { revalidatePath } from 'next/cache';

import { UpdateCart } from '@fxa/payments/cart';
import {
  CouponErrorExpired,
  CouponErrorGeneric,
  CouponErrorLimitReached,
} from '@fxa/payments/customer';
import { getApp } from '../nestapp/app';
import { UpdateCartActionArgs } from '../nestapp/validators/UpdateCartActionArgs';
import { CouponErrorMessageType } from '../utils/error-ftl-messages';

export const updateCartAction = async (
  cartId: string,
  version: number,
  cartDetails: UpdateCart
) => {
  const actionsService = getApp().getActionsService();

  try {
    await actionsService.updateCart(
      plainToClass(UpdateCartActionArgs, {
        cartId,
        version,
        cartDetails,
      })
    );
  } catch (err) {
    if (err instanceof CouponErrorExpired) {
      return CouponErrorMessageType.Expired;
    } else if (err instanceof CouponErrorGeneric) {
      return CouponErrorMessageType.Generic;
    } else if (err instanceof CouponErrorLimitReached) {
      return CouponErrorMessageType.LimitReached;
    } else {
      return CouponErrorMessageType.Invalid;
    }
  }

  revalidatePath(
    '/[locale]/[offeringId]/checkout/[interval]/[cartId]/start',
    'page'
  );

  return;
};
