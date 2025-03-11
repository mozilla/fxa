/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { auth } from 'apps/payments/next/auth';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { setupCartAction } from '@fxa/payments/ui/actions';
import { CartEligibilityStatus } from '@fxa/shared/db/mysql/account';
import { BaseParams, buildRedirectUrl } from '@fxa/payments/ui';
import { config } from 'apps/payments/next/config';
import type { SubplatInterval } from '@fxa/payments/customer';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: BaseParams;
  }
) {
  const { offeringId, interval, locale } = params;
  const searchParams = request.nextUrl.searchParams;
  const session = await auth();

  const fxaUid = session?.user?.id;
  const coupon = searchParams.get('coupon') || undefined;
  const countryCode = searchParams.get('countryCode') || undefined;
  const postalCode = searchParams.get('postalCode') || undefined;
  const taxAddress =
    countryCode && postalCode ? { countryCode, postalCode } : undefined;

  if (!taxAddress) {
    const redirectToUrl = new URL(
      buildRedirectUrl(
        params.offeringId,
        params.interval,
        'location',
        'checkout',
        {
          locale: params.locale,
          baseUrl: config.paymentsNextHostedUrl,
          searchParams: Object.fromEntries(searchParams),
        }
      )
    );
    redirect(redirectToUrl.href);
  }

  let redirectToUrl: URL;
  let pageType: 'checkout' | 'upgrade';
  try {
    const { id: cartId, eligibilityStatus } = await setupCartAction(
      interval as SubplatInterval,
      offeringId,
      taxAddress,
      undefined,
      coupon,
      fxaUid
    );

    pageType =
      eligibilityStatus === CartEligibilityStatus.UPGRADE
        ? 'upgrade'
        : 'checkout';

    redirectToUrl = new URL(
      buildRedirectUrl(offeringId, interval, 'start', pageType, {
        locale,
        cartId,
        baseUrl: config.paymentsNextHostedUrl,
        searchParams: Object.fromEntries(searchParams),
      })
    );
  } catch (error) {
    if (error.constructor.name === 'CartInvalidPromoCodeError') {
      const { id: cartId, eligibilityStatus } = await setupCartAction(
        interval as SubplatInterval,
        offeringId,
        taxAddress,
        undefined,
        undefined,
        fxaUid
      );

      pageType =
        eligibilityStatus === CartEligibilityStatus.UPGRADE
          ? 'upgrade'
          : 'checkout';

      redirectToUrl = new URL(
        buildRedirectUrl(offeringId, interval, 'start', pageType, {
          locale,
          cartId,
          baseUrl: config.paymentsNextHostedUrl,
          searchParams: Object.fromEntries(searchParams),
        })
      );
    } else {
      throw error;
    }
  }

  redirectToUrl.searchParams.set('pageType', pageType);

  redirect(redirectToUrl.href);
}
