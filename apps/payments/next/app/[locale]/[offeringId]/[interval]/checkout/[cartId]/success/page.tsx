/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';

import { formatPlanPricing } from '@fxa/payments/ui';
import { DEFAULT_LOCALE } from '@fxa/shared/l10n';

import { SupportedPages, getApp } from '@fxa/payments/ui/server';
import {
  fetchCMSData,
  getCartOrRedirectAction,
  recordEmitterEventAction,
} from '@fxa/payments/ui/actions';
import { CheckoutParams } from '@fxa/payments/ui/server';
import Image from 'next/image';
import Amex from '@fxa/shared/assets/images/payment-methods/amex.svg';
import Diners from '@fxa/shared/assets/images/payment-methods/diners.svg';
import Discover from '@fxa/shared/assets/images/payment-methods/discover.svg';
import Jcb from '@fxa/shared/assets/images/payment-methods/jcb.svg';
import Mastercard from '@fxa/shared/assets/images/payment-methods/mastercard.svg';
import Paypal from '@fxa/shared/assets/images/payment-methods/paypal.svg';
import Unbranded from '@fxa/shared/assets/images/payment-methods/unbranded.svg';
import UnionPay from '@fxa/shared/assets/images/payment-methods/unionpay.svg';
import Visa from '@fxa/shared/assets/images/payment-methods/visa.svg';

export const dynamic = 'force-dynamic';

function getCardIcon(cardBrand: string) {
  switch (cardBrand) {
    case 'amex':
      return Amex;
    case 'diners':
      return Diners;
    case 'discover':
      return Discover;
    case 'jcb':
      return Jcb;
    case 'mastercard':
      return Mastercard;
    case 'paypal':
      return Paypal;
    case 'unionpay':
      return UnionPay;
    case 'visa':
      return Visa;
    default:
      return Unbranded;
  }
}

export default async function CheckoutSuccess({
  params,
  searchParams,
}: {
  params: CheckoutParams;
  searchParams: Record<string, string>;
}) {
  // Temporarily defaulting to `accept-language`
  // This to be updated in FXA-9404
  //const locale = getLocaleFromRequest(
  //  params,
  //  headers().get('accept-language')
  //);
  const locale = headers().get('accept-language') || DEFAULT_LOCALE;

  const cmsDataPromise = fetchCMSData(params.offeringId, locale);
  const cartDataPromise = getCartOrRedirectAction(
    params.cartId,
    SupportedPages.SUCCESS,
    searchParams
  );
  const l10n = getApp().getL10n(locale);
  const [cms, cart] = await Promise.all([cmsDataPromise, cartDataPromise]);

  recordEmitterEventAction(
    'checkoutSuccess',
    { ...params },
    searchParams,
    cart.paymentInfo.type
  );

  const { successActionButtonUrl, successActionButtonLabel } =
    cms.commonContent.localizations.at(0) || cms.commonContent;

  return (
    <>
      <section className="h-[640px]" aria-label="Payment confirmation">
        <div className="flex flex-col items-center text-center pb-16 border-b border-grey-200">
          <div className="bg-[#D5F9FF] rounded-md py-5 px-8 mt-5">
            <h4 className="text-xl font-medium mx-0 mb-2">
              {l10n.getString(
                'next-payment-confirmation-thanks-heading-account-exists',
                'Thanks, now check your email!'
              )}
            </h4>

            <p className="text-black max-w-sm text-sm leading-5 font-normal">
              {l10n.getString(
                'payment-confirmation-thanks-subheading-account-exists-2',
                {
                  email: cart.email || '',
                },
                `You’ll receive an email at ${cart.email} with instructions about your subscription, as well as your payment details.`
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

        <div className="border-b border-grey-200 pb-6 text-sm">
          <div className="font-semibold py-4">
            {l10n.getString(
              'next-payment-confirmation-details-heading-2',
              'Payment information'
            )}
          </div>
          <div className="flex items-center justify-between text-grey-400">
            <span>
              {formatPlanPricing(
                cart.latestInvoicePreview?.totalAmount ?? null,
                cart.latestInvoicePreview?.currency ?? '',
                cart.interval
              )}
            </span>
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
        </div>

        <a
          className="flex items-center justify-center bg-blue-500 hover:bg-blue-700 font-semibold h-12 my-8 rounded-md text-white w-full"
          href={successActionButtonUrl}
        >
          {successActionButtonLabel ||
            l10n.getString(
              'next-payment-confirmation-download-button',
              'Continue to download'
            )}
        </a>
      </section>
    </>
  );
}
