/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { headers } from 'next/headers';
import {
  CouponForm,
  MetricsWrapper,
  PurchaseDetails,
  SelectTaxLocation,
} from '@fxa/payments/ui';
import { fetchCMSData, getCartAction } from '@fxa/payments/ui/actions';
import {
  getApp,
  CheckoutParams,
  PriceInterval,
  SignedIn,
  SubscriptionTitle,
  TermsAndPrivacy,
} from '@fxa/payments/ui/server';
import { auth } from 'apps/payments/next/auth';
import { config } from 'apps/payments/next/config';

// TODO - Replace these placeholders as part of FXA-8227
export const metadata = {
  title: 'Mozilla accounts',
  description: 'Mozilla accounts',
};

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
  const { locale } = params;
  const acceptLanguage = headers().get('accept-language');
  const cmsDataPromise = fetchCMSData(
    params.offeringId,
    acceptLanguage,
    locale
  );
  const cartDataPromise = getCartAction(params.cartId);
  const sessionPromise = auth();
  const l10n = getApp().getL10n(acceptLanguage, locale);
  const [cms, cart, session] = await Promise.all([
    cmsDataPromise,
    cartDataPromise,
    sessionPromise,
  ]);
  const purchaseDetails =
    cms.defaultPurchase.purchaseDetails.localizations.at(0) ||
    cms.defaultPurchase.purchaseDetails;
  return (
    <MetricsWrapper cart={cart}>
      {session?.user?.email && (
        <div className="mb-8 tablet:hidden">
          <SignedIn email={session.user.email} />
        </div>
      )}
      <div className="mx-7 tablet:grid tablet:grid-cols-[minmax(min-content,500px)_minmax(20rem,1fr)] tablet:grid-rows-[min-content] tablet:gap-x-8 tablet:mt-4 tablet:mb-auto desktop:grid-cols-[600px_1fr]">
        <SubscriptionTitle cartState={cart.state} l10n={l10n} />

        <section
          className="mb-6 tablet:mt-6 tablet:min-w-[18rem] tablet:max-w-xs tablet:col-start-2 tablet:col-end-auto tablet:row-start-1 tablet:row-end-3"
          aria-label="Purchase details"
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
          <SelectTaxLocation
            cartId={cart.id}
            cartVersion={cart.version}
            cmsCountries={cms.countries}
            locale={locale.substring(0, 2)}
            productName={purchaseDetails.productName}
            unsupportedLocations={config.subscriptionsUnsupportedLocations}
            countryCode={cart.taxAddress?.countryCode}
            postalCode={cart.taxAddress?.postalCode}
          />
          <CouponForm
            cartId={cart.id}
            cartVersion={cart.version}
            promoCode={cart.couponCode}
            readOnly={false}
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
