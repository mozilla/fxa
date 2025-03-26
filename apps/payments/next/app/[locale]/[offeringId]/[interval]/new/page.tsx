/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { auth } from 'apps/payments/next/auth';
import { redirect } from 'next/navigation';
import { setupCartAction } from '@fxa/payments/ui/actions';
import { CartEligibilityStatus } from '@fxa/shared/db/mysql/account';
import { BaseParams, buildRedirectUrl } from '@fxa/payments/ui';
import { config } from 'apps/payments/next/config';
import type { SubplatInterval } from '@fxa/payments/customer';

export const dynamic = 'force-dynamic';

export default async function New({
  params,
  searchParams,
}: {
  params: BaseParams;
  searchParams: Record<string, string>;
}) {
  const { offeringId, interval, locale } = params;
  const session = await auth();

  const fxaUid = session?.user?.id;
  const coupon = searchParams.coupon || undefined;
  const countryCode = searchParams.countryCode || undefined;
  const postalCode = searchParams.postalCode || undefined;
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
          searchParams: searchParams,
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
        searchParams,
      })
    );
  } catch (error) {
    if (error.name === 'CartInvalidPromoCodeError') {
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
          searchParams,
        })
      );
    } else {
      throw error;
    }
  }

  redirectToUrl.searchParams.delete('countryCode');
  redirectToUrl.searchParams.delete('postalCode');

  redirect(redirectToUrl.href);
}
