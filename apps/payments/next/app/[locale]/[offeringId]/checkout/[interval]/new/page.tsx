/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { setupCartAction } from '@fxa/payments/ui/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

interface CheckoutNewParams {
  locale: string;
  offeringId: string;
  interval: string;
}

export default async function CheckoutNew({
  params,
}: {
  params: CheckoutNewParams;
}) {
  const { offeringId, interval } = params;
  const ip = (headers().get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];
  const { id: cartId } = await setupCartAction(
    interval,
    offeringId,
    undefined,
    undefined,
    undefined,
    ip
  );

  redirect(`${cartId}/start`);
}
