/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { auth } from 'apps/payments/next/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { setupCartAction } from '@fxa/payments/ui/actions';
import { CartEligibilityStatus } from '@fxa/shared/db/mysql/account';

export const dynamic = 'force-dynamic';

interface CheckoutNewParams {
  locale: string;
  offeringId: string;
  interval: string;
}

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: CheckoutNewParams;
  }
) {
  const { offeringId, interval } = params;
  const redirectToUrl = request.nextUrl.clone();
  const searchParams = request.nextUrl.searchParams;
  const coupon = searchParams.get('coupon') || undefined;
  const session = await auth();

  const fxaUid = session?.user?.id;
  const ip = (headers().get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];

  let eligibilityStatus = 'checkout';
  let cartId: string;
  try {
    const currentCart = await setupCartAction(
      interval,
      offeringId,
      undefined,
      coupon,
      fxaUid,
      ip
    );
    cartId = currentCart.id;

    eligibilityStatus =
      currentCart.eligibilityStatus === CartEligibilityStatus.UPGRADE
        ? 'upgrade'
        : 'checkout';
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

  redirectToUrl.pathname = redirectToUrl.pathname.replace(
    '/new',
    `/${eligibilityStatus}/${cartId}/start`
  );

  redirect(redirectToUrl.href);
}
