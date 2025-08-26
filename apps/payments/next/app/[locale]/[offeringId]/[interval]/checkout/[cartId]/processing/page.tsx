/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  PaymentStateObserver,
  CheckoutParams,
  LoadingSpinner,
} from '@fxa/payments/ui';
import {
  getApp,
  SupportedPages,
  buildPageMetadata,
} from '@fxa/payments/ui/server';
import { headers } from 'next/headers';
import {
  validateCartStateAndRedirectAction,
  handleStripeRedirect
} from '@fxa/payments/ui/actions';
import type { Metadata } from 'next';
import { config } from 'apps/payments/next/config';
import { revalidatePath } from 'next/cache';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: CheckoutParams;
  searchParams: Record<string, string | string[]> | undefined;
}): Promise<Metadata> {
  return buildPageMetadata({
    params,
    page: 'processing',
    pageType: 'checkout',
    acceptLanguage: headers().get('accept-language'),
    baseUrl: config.paymentsNextHostedUrl,
    searchParams,
  });
}

export default async function ProcessingPage({
  params,
  searchParams,
}: {
  params: CheckoutParams;
  searchParams: Record<string, string | string[]> | undefined;
}) {
  const { locale, cartId, offeringId, interval } = params;
  const acceptLanguage = headers().get('accept-language');
  const l10n = getApp().getL10n(acceptLanguage, locale);

  const paymentIntentId = typeof searchParams?.payment_intent === 'string' ? searchParams.payment_intent : null;
  const clientSecret = typeof searchParams?.payment_intent_client_secret === 'string' ? searchParams.payment_intent_client_secret : null;
  const redirectStatus = typeof searchParams?.redirect_status === 'string' ? searchParams.redirect_status : null;

  if (paymentIntentId && clientSecret && redirectStatus) {
    try {
      await handleStripeRedirect(cartId, paymentIntentId, redirectStatus);
    } catch {
      revalidatePath(`/${locale}/${offeringId}/${interval}/checkout/${cartId}/processing`);
    }
  }

  await validateCartStateAndRedirectAction(
    params.cartId,
    SupportedPages.PROCESSING,
    searchParams
  );
  return (
    <section
      className="flex flex-col text-center text-sm"
      data-testid="payment-processing"
      aria-labelledby="processing-payment-heading"
    >
      <LoadingSpinner className="w-10 h-10" />
      <PaymentStateObserver cartId={params.cartId} />
      <h2 id="processing-payment-heading">
        {l10n.getString(
          'next-payment-processing-message',
          `Please wait while we process your payment…`
        )}
      </h2>
    </section>
  );
}
