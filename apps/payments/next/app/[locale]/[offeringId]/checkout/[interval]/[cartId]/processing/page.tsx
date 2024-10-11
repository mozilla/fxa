/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CheckoutParams,
  LoadingSpinner,
  PollingSection,
} from '@fxa/payments/ui';
import { getApp } from '@fxa/payments/ui/server';
import { headers } from 'next/headers';
import { DEFAULT_LOCALE } from '@fxa/shared/l10n';

export default function ProcessingPage({ params }: { params: CheckoutParams }) {
  const locale = headers().get('accept-language') || DEFAULT_LOCALE;
  const l10n = getApp().getL10n(locale);
  return (
    <section
      className="flex flex-col text-center text-sm"
      data-testid="payment-processing"
    >
      <LoadingSpinner className="w-10 h-10" />
      <PollingSection cartId={params.cartId} />
      {l10n.getString(
        'next-payment-processing-message',
        `Please wait while we process your payment…`
      )}
    </section>
  );
}
