/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { auth } from 'apps/payments/next/auth';
import { notFound, redirect } from 'next/navigation';
import {
  validateLocationAction,
  getTaxAddressAction,
  setupCartAction,
  updateCartUidAction,
} from '@fxa/payments/ui/actions';
import { CartEligibilityStatus, CartState } from '@fxa/shared/db/mysql/account';
import { BaseParams, buildRedirectUrl } from '@fxa/payments/ui';
import { config } from 'apps/payments/next/config';
import type { SubplatInterval } from '@fxa/payments/customer';
import type { ResultCart } from '@fxa/payments/cart';
import { getIpAddress } from '@fxa/payments/ui/server';

function getRedirectToUrl(
  cart: ResultCart,
  params: BaseParams,
  searchParams: Record<string, string>
) {
  const { id, state, eligibilityStatus } = cart;
  const { offeringId, interval, locale } = params;

  const page = state === CartState.FAIL ? 'error' : 'start';
  const pageType =
    eligibilityStatus === CartEligibilityStatus.UPGRADE
      ? 'upgrade'
      : 'checkout';

  return new URL(
    buildRedirectUrl(offeringId, interval, page, pageType, {
      locale,
      cartId: id,
      baseUrl: config.paymentsNextHostedUrl,
      searchParams,
    })
  );
}

export const dynamic = 'force-dynamic';

export default async function New({
  params,
  searchParams,
}: {
  params: BaseParams;
  searchParams: Record<string, string>;
}) {
  const { offeringId, interval } = params;
  const ipAddress = getIpAddress();
  const session = await auth();

  const fxaUid = session?.user?.id;
  const coupon = searchParams.coupon || undefined;
  const countryCode = searchParams.countryCode;
  const postalCode = searchParams.postalCode;

  const taxAddress =
    countryCode && postalCode
      ? { countryCode, postalCode }
      : await getTaxAddressAction(ipAddress, fxaUid);

  // Check if the customer is in a location not supported by Subscription Platform
  // or whether the product is not available in the customer's location
  const { isValid: locationIsValid } = await validateLocationAction(
    offeringId,
    taxAddress,
    fxaUid
  );

  if (!taxAddress || !locationIsValid) {
    if (taxAddress?.countryCode) {
      searchParams.countryCode = taxAddress.countryCode;
    }
    if (taxAddress?.postalCode) {
      searchParams.postalCode = taxAddress.postalCode;
    }

    const locationPageUrl = new URL(
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
    redirect(locationPageUrl.href);
  }

  let redirectToUrl: URL;
  let cart: ResultCart;

  if (searchParams.cartId && fxaUid && searchParams.cartVersion) {
    cart = await updateCartUidAction(
      searchParams.cartId,
      Number(searchParams.cartVersion),
      fxaUid,
    );

    redirectToUrl = getRedirectToUrl(cart, params, searchParams);
  } else {
    try {
      cart = await setupCartAction(
        interval as SubplatInterval,
        offeringId,
        taxAddress,
        undefined,
        coupon,
        fxaUid
      );

      redirectToUrl = getRedirectToUrl(cart, params, searchParams);
    } catch (error) {
      if (error.name === 'CartInvalidPromoCodeError') {
        cart = await setupCartAction(
          interval as SubplatInterval,
          offeringId,
          taxAddress,
          undefined,
          undefined,
          fxaUid
        );

        redirectToUrl = getRedirectToUrl(cart, params, searchParams);
      } else if (
        error.name === 'RetrieveStripePriceInvalidOfferingError' ||
        error.name === 'RetrieveStripePriceNotFoundError'
      ) {
        notFound();
      } else {
        throw error;
      }
    }
  }

  redirectToUrl.searchParams.delete('cartId');
  redirectToUrl.searchParams.delete('cartVersion');

  redirect(redirectToUrl.href);
}
