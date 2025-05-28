/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CheckoutParams,
  LoadingSpinner,
  StripeWrapper,
  PaymentInputHandler,
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

export async function generateMetadata(
  {
    params,
    searchParams,
  }: {
    params: CheckoutParams;
    searchParams: Record<string, string> | undefined;
  },
): Promise<Metadata> {
  return buildPageMetadata({
    params,
    page: 'needs_input',
    pageType: 'upgrade',
    acceptLanguage: headers().get('accept-language'),
    baseUrl: config.paymentsNextHostedUrl,
    searchParams
  });
}

export default async function NeedsInputPage({
  params,
  searchParams,
}: {
  params: CheckoutParams;
  searchParams: Record<string, string> | undefined;
}) {
  const { locale } = params;
  const acceptLanguage = headers().get('accept-language');
  const l10n = getApp().getL10n(acceptLanguage, locale);
  const cart = await getCartOrRedirectAction(
    params.cartId,
    SupportedPages.NEEDS_INPUT,
    searchParams
  );
  if (!cart.currency) {
    throw new Error('Currency is missing from the cart');
  }
  return (
    <section
      className="flex flex-col text-center text-sm"
      data-testid="payment-processing"
    >
      <LoadingSpinner className="w-10 h-10" />
      <StripeWrapper
        amount={cart.amount}
        currency={cart.currency.toLowerCase()}
        locale={locale}
        cart={cart}
      >
        <PaymentInputHandler cartId={params.cartId} />
      </StripeWrapper>
      {l10n.getString(
        'next-payment-processing-message',
        `Please wait while we process your payment…`
      )}
    </section>
  );
}
