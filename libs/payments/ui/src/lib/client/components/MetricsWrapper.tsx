/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import * as Sentry from '@sentry/nextjs';
import { WithContextCart } from '@fxa/payments/cart';
import { useEffect } from 'react';

export function MetricsWrapper({
  cart,
  children,
}: {
  cart?: WithContextCart;
  children: React.ReactNode;
}) {
  useEffect(() => {
    cart &&
      Sentry.getGlobalScope().setTag('metricsOptedOut', cart.metricsOptedOut);
  }, [cart?.metricsOptedOut]);

  return <>{children}</>;
}
