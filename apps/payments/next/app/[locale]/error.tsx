/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import errorIcon from '@fxa/shared/assets/images/error.svg';
import { CheckoutParams, LoadingSpinner } from '@fxa/payments/ui';
import Link from 'next/link';
import { Localized } from '@fluent/react';
import { restartCartAction, getCartAction } from '@fxa/payments/ui/actions';

interface ErrorParams extends CheckoutParams {
  [param: string]: any;
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { locale, offeringId, interval, cartId } = useParams<ErrorParams>();
  const hasProductData = locale && offeringId && interval;

  const SUPPORT_URL = process.env.SUPPORT_URL ?? 'https://support.mozilla.org';

  // Reset the view if the cart is in a success state, or restart the cart and redirect
  async function redirectWithCart() {
    setLoading(true);
    try {
      const cart = await getCartAction(cartId);
      if (cart.state === 'start') {
        const newCart = await restartCartAction(cartId);
        setLoading(false);
        router.push(
          `/${locale}/${offeringId}/${interval}/checkout/${newCart.id}/${cart.state}`
        );
      } else {
        setLoading(false);
        reset();
      }
    } catch (getCartError) {
      Sentry.captureException(getCartError);
      setLoading(false);
      router.push(`/${locale}/${offeringId}/${interval}/landing`);
    }
  }

  function handleProductRetry() {
    if (cartId) {
      redirectWithCart();
    } else {
      router.push(`/${locale}/${offeringId}/${interval}/landing`);
    }
  }

  return (
    <section
      className="flex flex-col items-center text-center pb-8 mt-5 desktop:mt-2 h-[640px]"
      aria-label="Payment error"
    >
      <Image src={errorIcon} alt="" className="mt-16 mb-10" />
      <Localized
        id="checkout-error-boundary-basic-error-message"
        elems={{
          contactSupportLink: (
            <Link href={SUPPORT_URL} className="underline hover:text-grey-400">
              contact support.
            </Link>
          ),
        }}
      >
        <p className="text-grey-400 max-w-sm text-sm px-7 py-0 mb-4 ">
          Something went wrong. Please try again or
          <Link href={SUPPORT_URL} className="underline hover:text-grey-400">
            contact support.
          </Link>
        </p>
      </Localized>

      {hasProductData && (
        <button
          className="flex items-center justify-center bg-blue-500 hover:bg-blue-700 font-semibold h-12 my-8 rounded-md text-white w-full"
          disabled={loading}
          onClick={handleProductRetry}
        >
          {loading ? (
            <LoadingSpinner className="w-8 h-8" />
          ) : (
            <Localized id="checkout-error-boundary-retry-button">
              Try again
            </Localized>
          )}
        </button>
      )}
    </section>
  );
}
