/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Image from 'next/image';
import { InvoicePreview } from '@fxa/payments/customer';
import { PriceInterval } from '@fxa/payments/ui/server';
import { LocalizerRsc } from '@fxa/shared/l10n/server';
import { formatPlanInterval } from '../../../utils/helpers';

type UpgradePurchaseDetailsProps = {
  fromPrice: {
    currency: string;
    interval: string;
    unitAmount: number;
  };
  fromPurchaseDetails: {
    subtitle: string | null;
    productName: string;
    webIcon: string;
  };
  interval: string;
  invoice: InvoicePreview;
  l10n: LocalizerRsc;
  offeringPrice: number;
  purchaseDetails: {
    subtitle: string | null;
    productName: string;
    webIcon: string;
  };
  locale: string;
};

export function UpgradePurchaseDetails(props: UpgradePurchaseDetailsProps) {
  const {
    fromPrice,
    fromPurchaseDetails,
    interval,
    invoice,
    l10n,
    offeringPrice,
    purchaseDetails,
    locale,
  } = props;
  const { productName, subtitle, webIcon } = purchaseDetails;
  const {
    amountDue,
    creditApplied,
    currency,
    discountAmount,
    startingBalance,
    subtotal,
    taxAmounts,
    totalAmount,
    unusedAmountTotal,
  } = invoice;
  const exclusiveTaxRates = taxAmounts.filter(
    (taxAmount) => !taxAmount.inclusive
  );
  return (
    <section
      aria-labelledby="current-plan new-plan"
      className="bg-white rounded-b-lg shadow-sm shadow-grey-300 text-sm pt-4 px-4 rounded-t-none clip-shadow tablet:rounded-t-lg"
    >
      <h2 id="current-plan" className="font-semibold py-2">
        {l10n.getString(
          'upgrade-purchase-details-current-plan-label',
          'Current plan'
        )}
      </h2>
      <div className="flex gap-4 my-0 py-4">
        <Image
          src={fromPurchaseDetails.webIcon}
          alt={fromPurchaseDetails.productName}
          data-testid="product-logo"
          className="w-16 h-16 rounded-lg"
          width={64}
          height={64}
        />
        <div className="text-start">
          <h3 className="text-grey-600 font-semibold leading-5 my-0 break-words">
            {fromPurchaseDetails.productName}
          </h3>
          <p className="text-grey-400 mt-1 mb-0">
            <PriceInterval
              l10n={l10n}
              amount={fromPrice.unitAmount}
              currency={fromPrice.currency}
              interval={fromPrice.interval}
              locale={locale}
            />
            {fromPurchaseDetails.subtitle && (
              <span>
                &nbsp;&bull;&nbsp;
                {fromPurchaseDetails.subtitle}
              </span>
            )}
          </p>
        </div>
      </div>

      <h2 id="new-plan" className="font-semibold py-2">
        {l10n.getString('upgrade-purchase-details-new-plan-label', 'New plan')}
      </h2>
      <div className="flex gap-4 my-0 py-4">
        <Image
          src={webIcon}
          alt={productName}
          data-testid="product-logo"
          className="w-16 h-16 rounded-lg"
          width={64}
          height={64}
        />

        <div className="text-start">
          <h3 className="text-grey-600 font-semibold leading-5 my-0 break-words">
            {productName}
          </h3>

          <p className="text-grey-400 mt-1 mb-0">
            <PriceInterval
              l10n={l10n}
              amount={offeringPrice}
              currency={currency}
              interval={interval}
              locale={locale}
            />
            {subtitle && (
              <span>
                &nbsp;&bull;&nbsp;
                {subtitle}
              </span>
            )}
          </p>
        </div>
      </div>

      <div
        className="border-b border-grey-200"
        role="separator"
        aria-hidden="true"
      ></div>

      <ul className="py-6 text-sm">
        <li className="flex items-center justify-between gap-2 leading-5 text-grey-600">
          <p>
            {l10n.getString(
              `upgrade-purchase-details-new-plan-${interval}`,
              {
                productName,
              },

              `${productName} (${formatPlanInterval(interval)})`
            )}
          </p>
          <p>
            {l10n.getLocalizedCurrencyString(offeringPrice, currency, locale)}
          </p>
        </li>

        {!!unusedAmountTotal && (
          <>
            <li className="flex items-center justify-between gap-2 leading-5 text-grey-600">
              <p>
                {l10n.getString(
                  'purchase-details-unused-time-label',

                  'Credit from unused time'
                )}
              </p>
              <p>
                {l10n.getLocalizedCurrencyString(
                  unusedAmountTotal,
                  currency,
                  locale
                )}
              </p>
            </li>

            <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 pb-4 font-semibold">
              <h3>
                {l10n.getString('purchase-details-subtotal-label', 'Subtotal')}
              </h3>
              <p>
                {l10n.getLocalizedCurrencyString(subtotal, currency, locale)}
              </p>
            </li>
          </>
        )}

        {!!discountAmount && discountAmount > 0 && (
          <li className="flex items-center justify-between gap-2 leading-5 text-grey-600">
            <p>
              {l10n.getString(
                'upgrade-purchase-details-promo-code',
                'Promo Code'
              )}
            </p>
            <p>
              {l10n.getLocalizedCurrencyString(
                -1 * discountAmount,
                currency,
                locale
              )}
            </p>
          </li>
        )}

        {exclusiveTaxRates.length === 1 &&
          exclusiveTaxRates[0].amount !== 0 && (
            <li className="flex items-center justify-between gap-2 leading-5 text-grey-600">
              <p>
                {l10n.getString(
                  'upgrade-purchase-details-tax-label',
                  'Taxes and Fees'
                )}
              </p>
              <p>
                {l10n.getLocalizedCurrencyString(
                  exclusiveTaxRates[0].amount,
                  currency,
                  locale
                )}
              </p>
            </li>
          )}

        <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 font-semibold">
          <h3>{l10n.getString('next-plan-details-total-label', 'Total')}</h3>
          <p
            className="overflow-hidden text-ellipsis whitespace-nowrap"
            data-testid="total-price"
          >
            {l10n.getLocalizedCurrencyString(totalAmount, currency, locale)}
          </p>
        </li>

        {!!creditApplied && startingBalance < 0 && (
          <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 pt-4">
            <p>
              {l10n.getString(
                'purchase-details-credit-applied-label',
                'Credit applied'
              )}
            </p>
            <p>
              {l10n.getLocalizedCurrencyString(creditApplied, currency, locale)}
            </p>
          </li>
        )}
      </ul>

      <div
        className="border-b border-grey-200"
        role="separator"
        aria-hidden="true"
      ></div>

      <div className="flex items-center justify-between gap-2 leading-5 text-base text-grey-600 py-4 font-semibold">
        <h3>
          {l10n.getString('purchase-details-total-due-label', 'Total due')}
        </h3>
        <p
          className="flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap"
          data-testid="amount-due"
        >
          {l10n.getLocalizedCurrencyString(amountDue, currency, locale)}
        </p>
      </div>

      {totalAmount < 0 && (
        <>
          <div
            className="border-b border-grey-200"
            role="separator"
            aria-hidden="true"
          ></div>

          <div className="flex items-center justify-between gap-2 leading-5 py-4 text-grey-600">
            <p>
              {l10n.getString(
                'upgrade-purchase-details-credit-to-account',
                'Credit issued to account'
              )}
            </p>
            <p
              className="flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap"
              data-testid="upgrade-added-credit"
            >
              {l10n.getLocalizedCurrencyString(
                -1 * totalAmount,
                currency,
                locale
              )}
            </p>
          </div>

          <p className="pb-4">
            {l10n.getString(
              'upgrade-purchase-details-credit-will-be-applied',
              'Credit will be applied to your account and used towards future invoices.'
            )}
          </p>
        </>
      )}
    </section>
  );
}

export default UpgradePurchaseDetails;
