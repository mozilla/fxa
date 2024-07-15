/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import Image from 'next/image';

import { formatPlanPricing } from '@fxa/payments/ui';
import { DEFAULT_LOCALE } from '@fxa/shared/l10n';

import { getFakeCartData } from 'apps/payments/next/app/_lib/apiClient';
import circledConfirm from '@fxa/shared/assets/images/circled-confirm.svg';
import {
  SupportedPages,
  getApp,
  fetchCMSData,
  getCartOrRedirectAction,
} from '@fxa/payments/ui/server';

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
    <div className="row-divider-grey-200 pb-6 text-sm">
      <div className="font-semibold py-4">{title}</div>
      <div className="flex items-center justify-between text-grey-400">
        <span>{detail1}</span>
        <span>{detail2}</span>
      </div>
    </div>
  );
};

interface CheckoutParams {
  cartId: string;
  locale: string;
  interval: string;
  offeringId: string;
}

export default async function CheckoutSuccess({
  params,
}: {
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
  const cartDataPromise = getCartOrRedirectAction(
    params.cartId,
    SupportedPages.SUCCESS
  );
  const l10n = getApp().getL10n(locale);
  const fakeCartDataPromise = getFakeCartData(params.cartId);
  const [cms, cart, fakeCart] = await Promise.all([
    cmsDataPromise,
    cartDataPromise,
    fakeCartDataPromise,
  ]);

  const { productName } =
    cms.defaultPurchase.data.attributes.purchaseDetails.data.attributes.localizations.data.at(
      0
    )?.attributes ||
    cms.defaultPurchase.data.attributes.purchaseDetails.data.attributes;
  const { successActionButtonUrl, successActionButtonLabel } =
    cms.commonContent.data.attributes.localizations.data.at(0)?.attributes ||
    cms.commonContent.data.attributes;

  return (
    <>
      <section className="h-[640px]" aria-label="Payment confirmation">
        <div className="page-message-container row-divider-grey-200">
          <Image src={circledConfirm} alt="" className="w-16 h-16" />

          <h4 className="text-xl font-normal mx-0 mt-6 mb-3">
            {l10n.getString(
              'next-payment-confirmation-thanks-heading',
              'Thank you!'
            )}
          </h4>

          <p className="page-message">
            {l10n.getString(
              'next-payment-confirmation-thanks-subheading',
              {
                email: cart.email || '',
                product_name: productName,
              },
              `A confirmation email has been sent to ${cart.email} with details on how to get started with ${productName}.`
            )}
          </p>
        </div>

        <ConfirmationDetail
          title={l10n.getString(
            'next-payment-confirmation-order-heading',
            'Order details'
          )}
          detail1={l10n.getString(
            'next-payment-confirmation-invoice-number',
            {
              invoiceNumber: fakeCart.invoiceNumber,
            },
            `Invoice #${fakeCart.invoiceNumber}`
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
                fakeCart.nextInvoice.totalAmount,
                fakeCart.nextInvoice.currency
              ),
              interval: cart.interval,
            },
            formatPlanPricing(
              fakeCart.nextInvoice.totalAmount,
              fakeCart.nextInvoice.currency,
              cart.interval
            )
          )}
          detail2={l10n.getString(
            'next-payment-confirmation-cc-card-ending-in',
            {
              last4: fakeCart.last4,
            },
            `Card ending in ${fakeCart.last4}`
          )}
        />

        <a className="page-button" href={successActionButtonUrl}>
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
