/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { setupCartAction } from '@fxa/payments/ui/server';
import { auth } from 'apps/payments/next/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

interface CheckoutNewParams {
  locale: string;
  offeringId: string;
  interval: string;
}

export default async function CheckoutNew({
  params,
  searchParams,
}: {
  params: CheckoutNewParams;
  searchParams: Record<string, string>;
}) {
  const { offeringId, interval } = params;
  const session = await auth();

  const fxaUid = session?.user?.id;
  const ip = (headers().get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];

  const { id: cartId } = await setupCartAction(
    interval,
    offeringId,
    undefined,
    undefined,
    fxaUid,
    ip
  );

  const searchParamsString = new URLSearchParams(searchParams).toString();
  if (searchParamsString) {
    redirect(`${cartId}/start?${searchParamsString}`);
  } else {
    redirect(`${cartId}/start`);
  }
}
