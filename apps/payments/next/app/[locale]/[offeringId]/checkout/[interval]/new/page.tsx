/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { setupCartAction } from '@fxa/payments/ui/actions';
import { auth } from 'apps/payments/next/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

interface CheckoutNewParams {
  locale: string;
  offeringId: string;
  interval: string;
}

export default async function CheckoutNew(props: {
  params: Promise<CheckoutNewParams>;
  searchParams: Promise<Record<string, string>>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { offeringId, interval } = params;
  const { coupon } = searchParams;
  const session = await auth();

  const fxaUid = session?.user?.id;
  const ip = ((await headers()).get('x-forwarded-for') ?? '127.0.0.1').split(
    ','
  )[0];

  let cartId: string;
  try {
    cartId = (
      await setupCartAction(interval, offeringId, undefined, coupon, fxaUid, ip)
    ).id;
  } catch (error) {
    if (error.constructor.name === 'CartInvalidPromoCodeError') {
      cartId = (
        await setupCartAction(
          interval,
          offeringId,
          undefined,
          undefined,
          fxaUid,
          ip
        )
      ).id;
    } else {
      throw error;
    }
  }

  const searchParamsString = new URLSearchParams(searchParams).toString();
  if (searchParamsString) {
    redirect(`${cartId}/start?${searchParamsString}`);
  } else {
    redirect(`${cartId}/start`);
  }
}
