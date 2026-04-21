/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { SupportedPages } from '@fxa/payments/ui';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { validateCartStateAndRedirectAction } from '../../../actions/validateCartStateAndRedirect';
import { recordEmitterEventAction } from '../../../actions';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function PaymentStateObserver({
  cartId,
  isFreeTrial,
}: {
  cartId: string;
  isFreeTrial?: boolean;
}) {
  const searchParams = useSearchParams();
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const searchParamsRecord: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    searchParamsRecord[key] = value;
  }
  useEffect(() => {
    const startTime = Date.now();
    let isPolling = true;

    const poll = async () => {
      if (!isPolling) return;

      const redirectResponse = await validateCartStateAndRedirectAction(
        cartId,
        SupportedPages.PROCESSING,
        pathname,
        searchParamsRecord,
        false,
      );

      if (redirectResponse?.state && redirectResponse?.redirectToUrl) {
        if (redirectResponse.state === 'success') {
          await recordEmitterEventAction(
            'checkoutSuccess',
            { ...params },
            searchParamsRecord,
            undefined,
            undefined,
            isFreeTrial
          );
        }

        if (redirectResponse.state === 'fail') {
          await recordEmitterEventAction(
            'checkoutFail',
            { ...params },
            searchParamsRecord,
            undefined,
            undefined,
            isFreeTrial
          );
        }

        isPolling = false;
        router.push(redirectResponse.redirectToUrl);

        return;
      }

      // Time out after 2 minutes of cart being in the processing state
      if (Date.now() - startTime > 120000) {
        isPolling = false;
        // TODO: add a cron job that cancels carts that are stuck in processing
      } else {
        await delay(1000);
        poll();
      }
    };

    poll();

    return () => {
      // Cleanup to stop polling if the component unmounts
      isPolling = false;
    };
  }, []);

  return <>{ }</>;
}