/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { headers } from 'next/headers';

import { CouponForm } from '@fxa/payments/ui';
import {
  fetchCMSData,
  getApp,
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
  const cmsDataPromise = fetchCMSData(params.offeringId, locale);
  const cartDataPromise = getCartAction(params.cartId);
  const l10n = getApp().getL10n(locale);
  const [cms, cart] = await Promise.all([cmsDataPromise, cartDataPromise]);

  return (
    <>
      <SubscriptionTitle cartState={cart.state} l10n={l10n} />

      <section className="payment-panel" aria-label="Purchase details">
        <PurchaseDetails
          l10n={l10n}
          interval={cart.interval}
          invoice={cart.invoicePreview}
          purchaseDetails={
            cms.defaultPurchase.data.attributes.purchaseDetails.data.attributes.localizations.data.at(
              0
            )?.attributes ||
            cms.defaultPurchase.data.attributes.purchaseDetails.data.attributes
          }
          discountEnd={cart.invoicePreview.discountEnd}
          discountType={cart.invoicePreview.discountType}
        />
        <CouponForm
          cartId={cart.id}
          cartVersion={cart.version}
          promoCode={cart.couponCode}
          readOnly={false}
        />
      </section>

      <div className="page-body rounded-t-lg tablet:rounded-t-none">
        {children}
        <TermsAndPrivacy
          l10n={l10n}
          {...cart}
          {...(cms.commonContent.data.attributes.localizations.data.at(0)
            ?.attributes || cms.commonContent.data.attributes)}
          {...(cms.defaultPurchase.data.attributes.purchaseDetails.data.attributes.localizations.data.at(
            0
          )?.attributes ||
            cms.defaultPurchase.data.attributes.purchaseDetails.data
              .attributes)}
          contentServerUrl={config.contentServerUrl}
          showFXALinks={true}
        />
      </div>
    </>
  );
}
