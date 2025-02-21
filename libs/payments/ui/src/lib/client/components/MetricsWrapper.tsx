/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { recordEmitterEventAction } from '../../actions/recordEmitterEvent';

export function MetricsWrapper({
  cart,
  children,
}: {
  cart?: {
    state: string;
    metricsOptedOut: boolean;
  };
  children: React.ReactNode;
}) {
  const params = useParams();
  const searchParams = useSearchParams();
  const [viewEventLogged, setViewEventLogged] = useState(false);

  useEffect(() => {
    // Log the view event only once
    // If this is added to the Start page, it will log everytime the page is reloaded/revalidated,
    // which includes when a PromoCode is applied
    if (!viewEventLogged && cart?.state === 'start') {
      setViewEventLogged(true);
      recordEmitterEventAction(
        'checkoutView',
        { ...params },
        Object.fromEntries(searchParams)
      );
    }
  }, []);

  useEffect(() => {
    cart &&
      Sentry.getGlobalScope().setTag('metricsOptedOut', cart.metricsOptedOut);
  }, [cart?.metricsOptedOut]);

  return <>{children}</>;
}
