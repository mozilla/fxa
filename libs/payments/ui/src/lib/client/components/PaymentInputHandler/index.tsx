/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import {
  getNeedsInputAction,
  submitNeedsInputAndRedirectAction,
  validateCartStateAndRedirectAction,
} from '@fxa/payments/ui/actions';
import { useEffect } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { SupportedPages } from '@fxa/payments/ui';
import { useSearchParams } from 'next/navigation';
export function PaymentInputHandler({ cartId }: { cartId: string }) {
  const stripe = useStripe();
  const searchParams = useSearchParams();
  const searchParamsRecord: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    searchParamsRecord[key] = value;
  }
  useEffect(() => {
    if (!stripe) {
      return;
    }
    const handleNextAction = async () => {
      const inputRequest = await getNeedsInputAction(cartId);
      switch (inputRequest.inputType) {
        case 'stripeHandleNextAction':
          await stripe.handleNextAction({
            clientSecret: inputRequest.data.clientSecret,
          });
          await submitNeedsInputAndRedirectAction(cartId);
          break;
        case 'notRequired':
          await validateCartStateAndRedirectAction(
            cartId,
            SupportedPages.NEEDS_INPUT,
            searchParamsRecord
          );
          break;
      }
    };
    handleNextAction();
  }, [stripe]);

  return <></>;
}
