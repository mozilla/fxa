/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  PaymentStateObserver,
  CheckoutParams,
  LoadingSpinner,
} from '@fxa/payments/ui';
import { getApp, SupportedPages } from '@fxa/payments/ui/server';
import { headers } from 'next/headers';
import { DEFAULT_LOCALE } from '@fxa/shared/l10n';
import { getCartOrRedirectAction } from '@fxa/payments/ui/actions';

export default async function ProcessingPage({
  params,
  searchParams,
}: {
  params: CheckoutParams;
  searchParams: Record<string, string> | undefined;
}) {
  const locale = headers().get('accept-language') || DEFAULT_LOCALE;
  const l10n = getApp().getL10n(locale);
  const cart = await getCartOrRedirectAction(
    params.cartId,
    SupportedPages.PROCESSING,
    searchParams
  );
  return (
    <section
      className="flex flex-col text-center text-sm"
      data-testid="payment-processing"
    >
      <LoadingSpinner className="w-10 h-10" />
      <PaymentStateObserver cartId={cart.id} />
      {l10n.getString(
        'next-payment-processing-message',
        `Please wait while we process your payment…`
      )}
    </section>
  );
}
