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
import { validateCartStateAndRedirectAction } from '@fxa/payments/ui/actions';
import type { Metadata } from 'next';
import { config } from 'apps/payments/next/config';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<CheckoutParams>;
  searchParams: Promise<Record<string, string | string[]> | undefined>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  return buildPageMetadata({
    params: resolvedParams,
    page: 'processing',
    pageType: 'checkout',
    acceptLanguage: (await headers()).get('accept-language'),
    baseUrl: config.paymentsNextHostedUrl,
    searchParams: resolvedSearchParams,
  });
}

export default async function ProcessingPage({
  params,
  searchParams,
}: {
  params: Promise<CheckoutParams>;
  searchParams: Promise<Record<string, string | string[]> | undefined>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { locale } = resolvedParams;
  const acceptLanguage = (await headers()).get('accept-language');
  const l10n = getApp().getL10n(acceptLanguage, locale);
  await validateCartStateAndRedirectAction(
    resolvedParams.cartId,
    SupportedPages.PROCESSING,
    resolvedSearchParams
  );
  return (
    <section
      className="flex flex-col text-center text-sm"
      data-testid="payment-processing"
      aria-labelledby="processing-payment-heading"
    >
      <LoadingSpinner className="w-10 h-10" />
      <PaymentStateObserver cartId={resolvedParams.cartId} />
      <h2 id="processing-payment-heading">
        {l10n.getString(
          'next-payment-processing-message',
          `Please wait while we process your payment…`
        )}
      </h2>
    </section>
  );
}
