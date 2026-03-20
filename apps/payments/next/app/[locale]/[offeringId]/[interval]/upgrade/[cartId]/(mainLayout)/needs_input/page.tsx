/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CheckoutParams,
  LoadingSpinner,
  StripeWrapper,
  PaymentInputHandler,
  buildRedirectUrl,
} from '@fxa/payments/ui';
import {
  getApp,
  SupportedPages,
  buildPageMetadata,
} from '@fxa/payments/ui/server';
import { headers } from 'next/headers';
import { getCartOrRedirectAction } from '@fxa/payments/ui/actions';
import { Metadata } from 'next';
import { config } from 'apps/payments/next/config';
import { auth } from 'apps/payments/next/auth';
import { redirect } from 'next/navigation';

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
    page: 'needs_input',
    pageType: 'upgrade',
    acceptLanguage: (await headers()).get('accept-language'),
    baseUrl: config.paymentsNextHostedUrl,
    searchParams: resolvedSearchParams,
  });
}

export default async function NeedsInputPage({
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
  const cartPromise = getCartOrRedirectAction(
    resolvedParams.cartId,
    SupportedPages.NEEDS_INPUT,
    resolvedSearchParams
  );
  const sessionPromise = auth();
  const [session, cart] = await Promise.all([sessionPromise, cartPromise]);
  if (!cart.currency) {
    throw new Error('Currency is missing from the cart');
  }

  if (!session?.user?.id || cart.uid !== session.user.id) {
    const redirectSearchParams: Record<string, string | string[]> =
      resolvedSearchParams || {};
    delete redirectSearchParams.cartId;
    delete redirectSearchParams.cartVersion;
    const redirectTo = buildRedirectUrl(
      resolvedParams.offeringId,
      resolvedParams.interval,
      'new',
      'checkout',
      {
        baseUrl: config.paymentsNextHostedUrl,
        locale,
        searchParams: redirectSearchParams,
      }
    );
    redirect(redirectTo);
  }

  return (
    <section
      className="flex flex-col text-center text-sm"
      data-testid="payment-processing"
      aria-labelledby="processing-payment-heading"
    >
      <LoadingSpinner className="w-10 h-10" />
      <StripeWrapper
        amount={cart.amount}
        currency={cart.currency.toLowerCase()}
        locale={locale}
        cart={cart}
      >
        <PaymentInputHandler cartId={resolvedParams.cartId} />
      </StripeWrapper>
      <h2 id="processing-payment-heading">
        {l10n.getString(
          'next-payment-processing-message',
          `Please wait while we process your payment…`
        )}
      </h2>
    </section>
  );
}
