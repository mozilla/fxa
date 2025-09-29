/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import Image from 'next/image';
import { getCardIcon, PaymentSection } from '@fxa/payments/ui';
import {
  fetchCMSData,
  getCartOrRedirectAction,
} from '@fxa/payments/ui/actions';
import {
  getApp,
  CheckoutParams,
  SignedIn,
  SupportedPages,
  buildPageMetadata,
} from '@fxa/payments/ui/server';
import { Metadata } from 'next';
import { config } from 'apps/payments/next/config';
import { auth } from 'apps/payments/next/auth';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: CheckoutParams;
  searchParams: Record<string, string | string[]> | undefined;
}): Promise<Metadata> {
  return buildPageMetadata({
    params,
    page: 'start',
    pageType: 'upgrade',
    acceptLanguage: headers().get('accept-language'),
    baseUrl: config.paymentsNextHostedUrl,
    searchParams,
  });
}

export default async function Upgrade({
  params,
  searchParams,
}: {
  params: CheckoutParams;
  searchParams: Record<string, string | string[]> | undefined;
}) {
  const { locale } = params;
  const acceptLanguage = headers().get('accept-language');
  const nonce = headers().get('x-nonce') || undefined;
  const l10n = getApp().getL10n(acceptLanguage, locale);
  const session = await auth();

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

  return (
    <>
      {session?.user?.email && (
        <section
          aria-labelledby="signedin-heading"
          className="hidden tablet:block"
        >
          <SignedIn email={session.user.email} />
        </section>
      )}
      <section
        aria-labelledby="upgrade-subscription-heading"
        data-testid="subscription-upgrade"
      >
        <h2
          id="upgrade-subscription-heading"
          className="font-semibold my-5 text-grey-600 text-lg text-start"
        >
          {l10n.getString(
            'upgrade-page-payment-information',
            'Payment information'
          )}
        </h2>

        {cart.paymentInfo && (
          <div className="flex items-center justify-between mt-4 text-sm">
            {cart.paymentInfo.walletType === 'apple_pay' ? (
              <div className="flex items-center gap-3">
                <Image
                  src={getCardIcon('apple_pay', l10n).img}
                  alt={l10n.getString('apple-pay-logo-alt-text', 'Apple Pay logo')}
                  width={40}
                  height={24}
                />
              </div>
            ) : cart.paymentInfo.walletType === 'google_pay' ? (
              <div className="flex items-center gap-3">
                <Image
                  src={getCardIcon('google_pay', l10n).img}
                  alt={l10n.getString('google-pay-logo-alt-text', 'Google Pay logo')}
                  width={40}
                  height={24}
                />
              </div>
            ) : cart.paymentInfo.type === 'external_paypal' ? (
              <Image
                src={getCardIcon('paypal', l10n).img}
                alt={l10n.getString('paypal-logo-alt-text', 'PayPal logo')}
                width={91}
                height={24}
              />
            ) : cart.paymentInfo.type === 'link' ? (
              <Image
                src={getCardIcon('link', l10n).img}
                alt={l10n.getString('link-logo-alt-text', 'Link logo')}
                width={70}
                height={24}
              />
            ) : (
              <span className="flex items-center gap-2">
                {cart.paymentInfo.brand && (
                  <Image
                    src={getCardIcon(cart.paymentInfo.brand, l10n).img}
                    alt={getCardIcon(cart.paymentInfo.brand, l10n).altText}
                    width={40}
                    height={24}
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
        )}

        <div
          className="border-b border-grey-200 my-6"
          role="separator"
          aria-hidden="true"
        ></div>

        <p
          className="leading-5 text-sm"
          data-testid="sub-update-acknowledgment"
        >
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

        <div
          className="border-b border-grey-200 my-6"
          role="separator"
          aria-hidden="true"
        ></div>

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
              cart={cart}
              locale={locale}
              nonce={nonce}
              paypalClientId={config.paypal.clientId}
              sessionUid={session?.user?.id}
              sessionEmail={session?.user?.email ?? undefined}
            />
          )}
      </section>
    </>
  );
}
