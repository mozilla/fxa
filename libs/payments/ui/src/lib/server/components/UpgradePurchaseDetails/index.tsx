/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Image from 'next/image';
import { CurrentPrice, Invoice } from '@fxa/payments/cart';
import { PriceInterval } from '@fxa/payments/ui/server';
import { LocalizerRsc } from '@fxa/shared/l10n/server';

type UpgradePurchaseDetailsProps = {
  currentPrice: CurrentPrice;
  currentPurchaseDetails: {
    subtitle: string | null;
    productName: string;
    webIcon: string;
  };
  interval: string;
  invoice: Invoice;
  l10n: LocalizerRsc;
  purchaseDetails: {
    subtitle: string | null;
    productName: string;
    webIcon: string;
  };
};

export function UpgradePurchaseDetails(props: UpgradePurchaseDetailsProps) {
  const {
    currentPrice,
    currentPurchaseDetails,
    interval,
    invoice,
    l10n,
    purchaseDetails,
  } = props;
  const {
    productName: currentProductName,
    subtitle: currentSubtitle,
    webIcon: currentWebIcon,
  } = currentPurchaseDetails;
  const { productName, subtitle, webIcon } = purchaseDetails;
  const {
    currency,
    discountAmount,
    listAmount,
    oneTimeCharge,
    taxAmounts,
    totalAmount,
  } = invoice;
  const exclusiveTaxRates = taxAmounts.filter(
    (taxAmount) => !taxAmount.inclusive
  );
  return (
    <div className="bg-white rounded-b-lg shadow-sm shadow-grey-300 text-sm px-4 rounded-t-none clip-shadow tablet:rounded-t-lg">
      <div className="pt-4">
        <h2 className="font-semibold py-2">
          {l10n.getString('next-sub-update-current-plan-label', 'Current Plan')}
        </h2>
        <div className="flex gap-4 my-0 py-4">
          <Image
            src={currentWebIcon}
            alt={currentProductName}
            data-testid="product-logo"
            className="w-16 h-16 rounded-lg"
            width={64}
            height={64}
          />

          <div className="text-start">
            <h3 className="text-grey-600 font-semibold leading-5 my-0 break-words">
              {currentProductName}
            </h3>

            <p className="text-grey-400 mt-1 mb-0">
              <PriceInterval
                l10n={l10n}
                currency={currentPrice.currency}
                interval={currentPrice.interval}
                listAmount={currentPrice.listAmount}
              />
              {currentSubtitle && (
                <span>
                  &nbsp;&bull;&nbsp;
                  {currentSubtitle}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-semibold py-2">
          {l10n.getString('next-sub-update-new-plan-label', 'New Plan')}
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
                currency={currency}
                interval={interval}
                listAmount={listAmount}
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
      </div>

      <div className="border-b border-grey-200"></div>

      <div>
        <ul className="pt-6">
          {!!listAmount && (
            <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 text-sm">
              <p>
                {l10n.getString('next-plan-details-list-price', 'List Price')}
              </p>
              <p>{l10n.getLocalizedCurrencyString(listAmount, currency)}</p>
            </li>
          )}

          {!!discountAmount && (
            <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 text-sm">
              <p>{l10n.getString('next-coupon-promo-code', 'Promo Code')}</p>
              <p>
                {l10n.getLocalizedCurrencyString(-1 * discountAmount, currency)}
              </p>
            </li>
          )}

          {exclusiveTaxRates.length === 1 && (
            <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 text-sm">
              <p>{l10n.getString('next-plan-details-tax', 'Taxes and Fees')}</p>
              <p>
                {l10n.getLocalizedCurrencyString(
                  exclusiveTaxRates[0].amount,
                  currency
                )}
              </p>
            </li>
          )}

          {exclusiveTaxRates.length > 1 &&
            exclusiveTaxRates.map((taxRate) => (
              <li
                key={taxRate.title}
                className="flex items-center justify-between gap-2 leading-5 text-grey-600 text-sm"
              >
                <p>{l10n.getString('tax', taxRate.title)}</p>
                <p>
                  {l10n.getLocalizedCurrencyString(taxRate.amount, currency)}
                </p>
              </li>
            ))}

          <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 text-sm mt-6 pt-4 pb-6 font-semibold">
            <h3 className="text-base">
              {l10n.getString('next-sub-update-total-label', 'New total')}
            </h3>
            <p
              className="overflow-hidden text-ellipsis text-lg whitespace-nowrap"
              data-testid="total-price"
            >
              <PriceInterval
                l10n={l10n}
                currency={currency}
                interval={interval}
                listAmount={listAmount}
                totalAmount={totalAmount}
              />
            </p>
          </li>

          <div className="border-b border-grey-200"></div>

          <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 text-sm mt-6 pb-6 font-semibold">
            <h3 className="text-base">
              {l10n.getString(
                'next-sub-update-prorated-upgrade',
                'Prorated Upgrade'
              )}
            </h3>
            <p
              className="overflow-hidden text-ellipsis text-lg whitespace-nowrap"
              data-testid="prorated-price"
            >
              <PriceInterval
                l10n={l10n}
                currency={currency}
                interval={interval}
                listAmount={listAmount}
                totalAmount={oneTimeCharge}
              />
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default UpgradePurchaseDetails;
