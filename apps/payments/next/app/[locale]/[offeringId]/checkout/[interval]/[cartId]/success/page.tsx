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

export const dynamic = 'force-dynamic';

type ConfirmationDetailProps = {
  title: string;
  detail1: string | Promise<string>;
  detail2: string;
};

const ConfirmationDetail = ({
  title,
  detail1,
  detail2,
}: ConfirmationDetailProps) => {
  return (
    <div className="border-b border-grey-200 pb-6 text-sm">
      <div className="font-semibold py-4">{title}</div>
      <div className="flex items-center justify-between text-grey-400">
        <span>{detail1}</span>
        <span>{detail2}</span>
      </div>
    </div>
  );
};

export default async function CheckoutSuccess(props: {
  params: Promise<CheckoutParams>;
  searchParams: Promise<Record<string, string>>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  // Temporarily defaulting to `accept-language`
  // This to be updated in FXA-9404
  //const locale = getLocaleFromRequest(
  //  params,
  //  headers().get('accept-language')
  //);
  const locale = (await headers()).get('accept-language') || DEFAULT_LOCALE;

  const cmsDataPromise = fetchCMSData(params.offeringId, locale);
  const cartDataPromise = getCartOrRedirectAction(
    params.cartId,
    SupportedPages.SUCCESS
  );
  const l10n = getApp().getL10n(locale);
  const [cms, cart] = await Promise.all([cmsDataPromise, cartDataPromise]);

  recordEmitterEventAction(
    'checkoutSuccess',
    { ...params },
    searchParams,
    'stripe'
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
                'next-payment-confirmation-thanks-subheading',
                {
                  email: cart.email || '',
                },
                `You'll receive an email at ${cart.email} with instructions about your subscription, as well as your payment details.`
              )}
            </p>
          </div>
        </div>

        <ConfirmationDetail
          title={l10n.getString(
            'next-payment-confirmation-order-heading',
            'Order details'
          )}
          detail1={l10n.getString(
            'next-payment-confirmation-invoice-number',
            {
              invoiceNumber: cart.latestInvoicePreview?.number ?? '',
            },
            `Invoice #${cart.latestInvoicePreview?.number}`
          )}
          detail2={l10n.getString(
            'next-payment-confirmation-invoice-date',
            {
              invoiceDate: l10n.getLocalizedDate(cart.createdAt / 1000),
            },
            l10n.getLocalizedDateString(cart.createdAt / 1000)
          )}
        />

        <ConfirmationDetail
          title={l10n.getString(
            'next-payment-confirmation-details-heading-2',
            'Payment information'
          )}
          detail1={l10n.getString(
            'next-payment-confirmation-amount',
            {
              amount: l10n.getLocalizedCurrency(
                cart.latestInvoicePreview?.totalAmount ?? null,
                cart.latestInvoicePreview?.currency ?? ''
              ),
              interval: cart.interval,
            },
            formatPlanPricing(
              cart.latestInvoicePreview?.totalAmount ?? null,
              cart.latestInvoicePreview?.currency ?? '',
              cart.interval
            )
          )}
          detail2={l10n.getString(
            'next-payment-confirmation-cc-card-ending-in',
            {
              last4: cart.last4 ?? '',
            },
            `Card ending in ${cart.last4}`
          )}
        />

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
