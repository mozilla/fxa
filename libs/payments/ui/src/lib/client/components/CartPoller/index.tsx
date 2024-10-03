/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { CheckoutParams, pollCart, SupportedPages } from '@fxa/payments/ui';
import {
  finalizeCartWithError,
  getCartAction,
  getCartOrRedirectAction,
} from '@fxa/payments/ui/actions';
import { CartErrorReasonId } from '@fxa/shared/db/mysql/account/kysely-types';
import { useEffect } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { useParams } from 'next/navigation';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function CartPoller() {
  const stripe = useStripe();
  const checkoutParams: CheckoutParams = useParams();

  useEffect(() => {
    let retries = 0;
    let isPolling = true;

    const fetchData = async () => {
      if (!isPolling) return;

      try {
        retries = await pollCart(
          checkoutParams,
          getCartOrRedirectAction,
          retries,
          stripe
        );
      } catch (error) {
        console.error(error);
        throw error;
      }

      if (retries > 5) {
        isPolling = false;
        const cart = await getCartAction(checkoutParams.cartId);
        await finalizeCartWithError(cart.id, CartErrorReasonId.BASIC_ERROR);
        await getCartOrRedirectAction(
          checkoutParams.cartId,
          SupportedPages.PROCESSING
        );
      } else {
        await delay(Math.pow(10, retries));
        fetchData();
      }
    };

    fetchData();

    return () => {
      // Cleanup to stop polling if the component unmounts
      isPolling = false;
    };
  }, [stripe]);

  return <></>;
}
