/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { revalidatePath } from 'next/cache';

import { UpdateCartInput } from '@fxa/payments/cart';
import { getApp } from '../nestapp/app';

export const updateTaxAddressAction = async (
  cartId: string,
  version: number,
  taxAddress: UpdateCartInput['taxAddress']
) => {
  const actionsService = getApp().getActionsService();

  const { taxAddress: cartTaxAddress } = await actionsService.updateCart({
    cartId,
    version,
    cartDetails: {
      taxAddress,
    },
  });

  if (!cartTaxAddress) {
    throw new Error('Cart address not updated');
  }

  revalidatePath(
    '/[locale]/[offeringId]/[interval]/checkout/[cartId]/start',
    'page'
  );

  return cartTaxAddress;
};
