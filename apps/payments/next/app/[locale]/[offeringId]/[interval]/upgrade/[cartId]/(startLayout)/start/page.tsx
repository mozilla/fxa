/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import assert from 'assert';
import { headers } from 'next/headers';
import Image from 'next/image';
import {
  getCardIcon,
  PaymentSection,
  buildPageMetadata,
} from '@fxa/payments/ui';
import {
  fetchCMSData,
  getCartOrRedirectAction,
} from '@fxa/payments/ui/actions';
import {
  getApp,
  CheckoutParams,
  SupportedPages,
} from '@fxa/payments/ui/server';
import { Metadata } from 'next';
import { config } from 'apps/payments/next/config';

export const dynamic = 'force-dynamic';

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
    titlePrefix: 'Upgrade',
    description: 'Enter your payment details to complete your upgrade.',
    page: 'start',
    pageType: 'upgrade',
    acceptLanguage: headers().get('accept-language'),
    baseUrl: config.paymentsNextHostedUrl,
    searchParams
  });
}

export default async function Upgrade({
  params,
  searchParams,
}: {
  params: CheckoutParams;
  searchParams: Record<string, string> | undefined;
}) {
  const { locale } = params;
  const acceptLanguage = headers().get('accept-language');
  const l10n = getApp().getL10n(acceptLanguage, locale);

  const cartDataPromise = getCartOrRedirectAction(
    params.cartId,
    SupportedPages.START,
    searchParams
  );
  const cmsDataPromise = fetchCMSData(
    params.offeringId,
    acceptLanguage,
    locale
  );
  const [cart, cms] = await Promise.all([cartDataPromise, cmsDataPromise]);
  assert(cart.paymentInfo, 'paymentInfo is missing in cart');

  return (
    <section aria-label="Upgrade" data-testid="subscription-upgrade">
      <h3 className="font-semibold text-grey-600 text-start">
        {l10n.getString(
          'upgrade-page-payment-information',
          'Payment information'
        )}
      </h3>

      <div className="flex items-center justify-between mt-4 text-sm">
        {cart.paymentInfo.type === 'external_paypal' ? (
          <Image src={getCardIcon('paypal')} alt="paypal" />
        ) : (
          <span className="flex items-center gap-2">
            {cart.paymentInfo.brand && (
              <Image
                src={getCardIcon(cart.paymentInfo.brand)}
                alt={cart.paymentInfo.brand}
              />
            )}
            {l10n.getString(
              'next-payment-confirmation-cc-card-ending-in',
              {
                last4: cart.paymentInfo.last4 ?? '',
              },
              `Card ending in ${cart.paymentInfo.last4}`
            )}
          </span>
        )}
      </div>

      <div className="border-b border-grey-200 my-6"></div>

      <p className="leading-5 text-sm" data-testid="sub-update-acknowledgment">
        {l10n.getString(
          'upgrade-page-acknowledgment',
          {
            nextInvoiceDate: l10n.getLocalizedDate(
              cart.upcomingInvoicePreview.nextInvoiceDate
            ),
          },
          `Your plan will change immediately, and you’ll be charged a prorated
          amount today for the rest of this billing cycle. Starting
          ${l10n.getLocalizedDateString(
            cart.upcomingInvoicePreview.nextInvoiceDate
          )}
          you’ll be charged the full amount.`
        )}
      </p>

      <div className="border-b border-grey-200 my-6"></div>

      {/*
        If currency could not be determiend, it is most likely due to an invalid
        or undetermined tax address. Future work will add the Tax Location picker
        which should allow a customer to set their tax location, which would then
        provide a valid currency.
      */}
      {cart.currency &&
        cart.taxAddress?.countryCode &&
        cart.taxAddress?.postalCode && (
          <PaymentSection
            cmsCommonContent={cms.commonContent}
            paymentsInfo={{
              amount: cart.amount,
              currency: cart.currency.toLowerCase(),
            }}
            cart={{
              ...cart,
              currency: cart.currency,
              taxAddress: {
                countryCode: cart.taxAddress.countryCode,
                postalCode: cart.taxAddress.postalCode,
              },
            }}
            locale={locale}
          />
        )}
    </section>
  );
}
