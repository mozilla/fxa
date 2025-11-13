/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Image from 'next/image';
import { auth } from 'apps/payments/next/auth';
import { getCardIcon } from '@fxa/payments/ui';
import {
  fetchCMSData,
  getCartOrRedirectAction,
} from '@fxa/payments/ui/actions';
import {
  getApp,
  CheckoutParams,
  SupportedPages,
  buildPageMetadata,
} from '@fxa/payments/ui/server';
import { config } from 'apps/payments/next/config';

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
    page: 'success',
    pageType: 'checkout',
    acceptLanguage: headers().get('accept-language'),
    baseUrl: config.paymentsNextHostedUrl,
    searchParams,
  });
}

export default async function CheckoutSuccess({
  params,
  searchParams,
}: {
  params: CheckoutParams;
  searchParams: Record<string, string | string[]>;
}) {
  const { locale } = params;
  const acceptLanguage = headers().get('accept-language');

  const cmsDataPromise = fetchCMSData(
    params.offeringId,
    acceptLanguage,
    locale
  );
  const cartDataPromise = getCartOrRedirectAction(
    params.cartId,
    SupportedPages.SUCCESS,
    searchParams
  );
  const sessionPromise = auth();
  const l10n = getApp().getL10n(locale);
  const [cms, cart, session] = await Promise.all([
    cmsDataPromise,
    cartDataPromise,
    sessionPromise,
  ]);

  const { successActionButtonUrl, successActionButtonLabel } =
    cms.commonContent.localizations.at(0) || cms.commonContent;

  return (
    <section
      className="h-[640px]"
      aria-labelledby="subscription-confirmation-heading"
    >
      <div className="flex flex-col items-center text-center pb-16 border-b border-grey-200">
        <div className="bg-[#D5F9FF] rounded-md py-5 px-8 mt-5">
          <h2
            id="subscription-confirmation-heading"
            className="text-xl font-medium mx-0 mb-2"
          >
            {l10n.getString(
              'next-payment-confirmation-thanks-heading-account-exists',
              'Thanks, now check your email!'
            )}
          </h2>

          <p className="text-black max-w-sm text-sm leading-5 font-normal">
            {l10n.getString(
              'payment-confirmation-thanks-subheading-account-exists-2',
              {
                email: session?.user?.email || '',
              },
              `You’ll receive an email at ${session?.user?.email} with instructions about your subscription, as well as your payment details.`
            )}
          </p>
        </div>
      </div>

      <div className="border-b border-grey-200 pb-6 text-sm">
        <div className="font-semibold py-4">
          {l10n.getString(
            'next-payment-confirmation-order-heading',
            'Order details'
          )}
        </div>
        <div className="flex items-center justify-between text-grey-400">
          <span>
            {l10n.getString(
              'next-payment-confirmation-invoice-number',
              {
                invoiceNumber: cart.latestInvoicePreview?.number ?? '',
              },
              `Invoice #${cart.latestInvoicePreview?.number}`
            )}
          </span>
          <span>
            {l10n.getString(
              'next-payment-confirmation-invoice-date',
              {
                invoiceDate: l10n.getLocalizedDate(cart.createdAt / 1000),
              },
              l10n.getLocalizedDateString(cart.createdAt / 1000)
            )}
          </span>
        </div>
      </div>

      <div className="text-sm">
        <div className="font-semibold py-4">
          {l10n.getString(
            'next-payment-confirmation-details-heading-2',
            'Payment information'
          )}
        </div>
        <div className="flex items-center justify-between text-grey-400">
          {l10n.getLocalizedCurrencyString(
            cart.latestInvoicePreview?.amountDue,
            cart.latestInvoicePreview?.currency,
            locale
          )}
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
                  className="w-10 h-auto object-cover"
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
      </div>

      <a
        className="flex items-center justify-center bg-blue-500 hover:bg-blue-700 font-semibold h-12 my-8 rounded-md text-white w-full"
        href={successActionButtonUrl}
        role="button"
      >
        {successActionButtonLabel ||
          l10n.getString(
            'next-payment-confirmation-download-button',
            'Continue to download'
          )}
      </a>
    </section>
  );
}
