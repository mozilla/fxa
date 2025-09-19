/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import {
  getNeedsInputAction,
  recordEmitterEventAction,
  submitNeedsInputAndRedirectAction,
  validateCartStateAndRedirectAction,
} from '@fxa/payments/ui/actions';
import { useEffect } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { SupportedPages } from '@fxa/payments/ui';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
export function PaymentInputHandler({ cartId }: { cartId: string }) {
  const stripe = useStripe();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
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
      if (inputRequest) {
        switch (inputRequest.inputType) {
          case 'stripeHandleNextAction':
            await stripe.handleNextAction({
              clientSecret: inputRequest.data.clientSecret,
            });
            await submitNeedsInputAndRedirectAction(cartId, params, searchParamsRecord);
            break;
          case 'notRequired':
            const redirectResponse = await validateCartStateAndRedirectAction(
              cartId,
              SupportedPages.NEEDS_INPUT,
              searchParamsRecord
            );

            if (redirectResponse?.state && redirectResponse?.redirectToUrl) {
              if (redirectResponse.state === 'success') {
                await recordEmitterEventAction(
                  'checkoutSuccess',
                  { ...params },
                  searchParamsRecord
                );
              }

              if (redirectResponse.state === 'fail') {
                await recordEmitterEventAction(
                  'checkoutFail',
                  { ...params },
                  searchParamsRecord
                );
              }

              router.push(redirectResponse.redirectToUrl);
            }
            break;
        }
      }
    };
    handleNextAction();
  }, [stripe]);

  return <></>;
}
