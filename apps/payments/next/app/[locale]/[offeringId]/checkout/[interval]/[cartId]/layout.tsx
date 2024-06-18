/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { headers } from 'next/headers';

import {
  getApp,
  fetchContentfulData,
  getCartAction,
  PurchaseDetails,
  SubscriptionTitle,
  TermsAndPrivacy,
} from '@fxa/payments/ui/server';
import { DEFAULT_LOCALE } from '@fxa/shared/l10n';
import { config } from 'apps/payments/next/config';

// TODO - Replace these placeholders as part of FXA-8227
export const metadata = {
  title: 'Mozilla accounts',
  description: 'Mozilla accounts',
};

export interface CheckoutParams {
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
  const contentfulDataPromise = fetchContentfulData(params.offeringId, locale);
  const cartDataPromise = getCartAction(params.cartId);
  const l10n = getApp().getL10n(locale);
  const [contentful, cart] = await Promise.all([
    contentfulDataPromise,
    cartDataPromise,
  ]);

  return (
    <>
      <SubscriptionTitle cartState={cart.state} l10n={l10n} />

      <section className="payment-panel" aria-label="Purchase details">
        <PurchaseDetails
          l10n={l10n}
          interval={cart.interval}
          invoice={cart.invoicePreview}
          purchaseDetails={contentful.defaultPurchase.purchaseDetails}
        />
      </section>

      <div className="page-body rounded-t-lg tablet:rounded-t-none">
        {children}
        <TermsAndPrivacy
          l10n={l10n}
          {...cart}
          {...contentful.commonContent}
          {...contentful.defaultPurchase.purchaseDetails}
          contentServerUrl={config.contentServerUrl}
          showFXALinks={true}
        />
      </div>
    </>
  );
}
