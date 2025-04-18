/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import { MetricsWrapper, PurchaseDetails } from '@fxa/payments/ui';
import { fetchCMSData, getCartAction } from '@fxa/payments/ui/actions';
import {
  getApp,
  CheckoutParams,
  PriceInterval,
  SubscriptionTitle,
  TermsAndPrivacy,
} from '@fxa/payments/ui/server';
import { config } from 'apps/payments/next/config';

export default async function UpgradeSuccessLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: CheckoutParams;
}) {
  const { locale } = params;
  const acceptLanguage = headers().get('accept-language');
  const l10n = getApp().getL10n(acceptLanguage, locale);
  const cartDataPromise = getCartAction(params.cartId);
  const cmsDataPromise = fetchCMSData(params.offeringId, locale);
  const [cms, cart] = await Promise.all([cmsDataPromise, cartDataPromise]);
  const purchaseDetails =
    cms.defaultPurchase.purchaseDetails.localizations.at(0) ||
    cms.defaultPurchase.purchaseDetails;
  return (
    <MetricsWrapper cart={cart}>
      <div className="mx-7 tablet:grid tablet:grid-cols-[minmax(min-content,500px)_minmax(20rem,1fr)] tablet:grid-rows-[min-content] tablet:gap-x-8 tablet:mb-auto desktop:grid-cols-[600px_1fr]">
        <SubscriptionTitle cart={cart} l10n={l10n} />
        <section
          className="mb-6 tablet:mt-6 tablet:min-w-[18rem] tablet:max-w-xs tablet:col-start-2 tablet:col-end-auto tablet:row-start-1 tablet:row-end-3"
          aria-label="Upgrade details"
        >
          <PurchaseDetails
            invoice={cart.upcomingInvoicePreview}
            purchaseDetails={purchaseDetails}
            priceInterval={
              <PriceInterval
                l10n={l10n}
                amount={cart.upcomingInvoicePreview.listAmount}
                currency={cart.upcomingInvoicePreview.currency}
                interval={cart.interval}
              />
            }
            totalPrice={
              <PriceInterval
                l10n={l10n}
                amount={cart.upcomingInvoicePreview.totalAmount}
                currency={cart.upcomingInvoicePreview.currency}
                interval={cart.interval}
              />
            }
          />
        </section>
        <div className="bg-white rounded-b-lg shadow-sm shadow-grey-300 border-t-0 mb-6 pt-4 px-4 pb-14 rounded-t-lg text-grey-600 tablet:clip-shadow tablet:rounded-t-none desktop:px-12 desktop:pb-12">
          {children}
          <TermsAndPrivacy
            l10n={l10n}
            {...cart}
            {...purchaseDetails}
            {...(cms.commonContent.localizations.at(0) || cms.commonContent)}
            contentServerUrl={config.contentServerUrl}
            showFXALinks={true}
          />
        </div>
      </div>
    </MetricsWrapper>
  );
}
