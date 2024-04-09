/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { headers } from 'next/headers';

import {
  app,
  PurchaseDetails,
  SubscriptionTitle,
  TermsAndPrivacy,
} from '@fxa/payments/ui/server';
import { getCartData, getContentfulContent } from '../../../_lib/apiClient';
import { DEFAULT_LOCALE } from '@fxa/shared/l10n';

// TODO - Replace these placeholders as part of FXA-8227
export const metadata = {
  title: 'Mozilla accounts',
  description: 'Mozilla accounts',
};

interface CheckoutParams {
  cartId: string;
  locale: string;
  interval: string;
  offeringId: string;
}

export interface CheckoutSearchParams {
  experiment?: string;
  promotion_code?: string;
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: CheckoutParams;
}) {
  // Temporarily defaulting to `accept-language`
  // This to be updated in FXA-9404
  //const locale = getLocaleFromRequest(
  //  params,
  //  headers().get('accept-language')
  //);
  const locale = headers().get('accept-language') || DEFAULT_LOCALE;
  const contentfulDataPromise = getContentfulContent(params.offeringId, locale);
  const cartDataPromise = getCartData(params.cartId);
  const l10nPromise = app.getL10n(locale);
  const [contentful, cart, l10n] = await Promise.all([
    contentfulDataPromise,
    cartDataPromise,
    l10nPromise,
  ]);

  return (
    <>
      <SubscriptionTitle cartState={cart.state} l10n={l10n} />

      <section className="payment-panel" aria-label="Purchase details">
        <PurchaseDetails
          l10n={l10n}
          interval={cart.interval}
          invoice={cart.nextInvoice}
          purchaseDetails={contentful.purchaseDetails}
        />
      </section>

      <div className="page-body rounded-t-lg tablet:rounded-t-none">
        {children}
        <TermsAndPrivacy
          l10n={l10n}
          {...cart}
          {...contentful.commonContent}
          {...contentful.purchaseDetails}
          showFXALinks={true}
        />
      </div>
    </>
  );
}
