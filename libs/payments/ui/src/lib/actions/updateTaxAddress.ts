/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { revalidatePath } from 'next/cache';

import { getApp } from '../nestapp/app';
import { TaxAddress } from '@fxa/payments/customer';

export const updateTaxAddressAction = async (
  cartId: string,
  version: number,
  offeringId: string,
  taxAddress: TaxAddress,
  uid?: string
) => {
  const actionsService = getApp().getActionsService();

  const result = await actionsService.updateTaxAddress({
    cartId,
    version,
    offeringId,
    taxAddress,
    uid,
  });

  revalidatePath(
    '/[locale]/[offeringId]/[interval]/checkout/[cartId]/start',
    'page'
  );

  return result;
};
