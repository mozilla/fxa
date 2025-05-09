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
    listAmount: number;
  };
  fromPurchaseDetails: {
    subtitle: string | null;
    productName: string;
    webIcon: string;
  };
  interval: string;
  invoice: InvoicePreview;
  l10n: LocalizerRsc;
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
    purchaseDetails,
    locale
  } = props;
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
    <div className="bg-white rounded-b-lg shadow-sm shadow-grey-300 text-sm pt-4 px-4 rounded-t-none clip-shadow tablet:rounded-t-lg">
      <h2 className="font-semibold py-2">
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
              amount={fromPrice.listAmount}
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

      <h2 className="font-semibold py-2">
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
              amount={listAmount}
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

      <div className="border-b border-grey-200"></div>

      <ul className="pt-6">
        {!!listAmount && listAmount > 0 && (
          <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 text-sm">
            <p>
              {l10n.getString(
                `upgrade-purchase-details-new-plan-${interval}`,
                {
                  productName,
                },

                `${productName} (${formatPlanInterval(interval)})`
              )}
            </p>
            <p>{l10n.getLocalizedCurrencyString(listAmount, currency, locale)}</p>
          </li>
        )}

        {!!discountAmount && discountAmount > 0 && (
          <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 text-sm">
            <p>
              {l10n.getString(
                'upgrade-purchase-details-promo-code',
                'Promo Code'
              )}
            </p>
            <p>
              {l10n.getLocalizedCurrencyString(-1 * discountAmount, currency, locale)}
            </p>
          </li>
        )}

        {exclusiveTaxRates.length === 1 && exclusiveTaxRates[0].amount > 0 && (
          <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 text-sm">
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

        {exclusiveTaxRates.length > 1 &&
          exclusiveTaxRates.map(
            (taxRate) =>
              taxRate.amount > 0 && (
                <li
                  key={taxRate.title}
                  className="flex items-center justify-between gap-2 leading-5 text-grey-600 text-sm"
                >
                  <p>{l10n.getString('tax', taxRate.title)}</p>
                  <p>
                    {l10n.getLocalizedCurrencyString(taxRate.amount, currency, locale)}
                  </p>
                </li>
              )
          )}

        <li className="flex items-center justify-between gap-2 leading-5 text-base text-grey-600 pt-4 pb-6 font-semibold">
          <h3>
            {l10n.getString(
              'upgrade-purchase-details-new-total-label',
              'New total'
            )}
          </h3>
          <p
            className="overflow-hidden text-ellipsis whitespace-nowrap"
            data-testid="total-price"
          >
            <PriceInterval
              l10n={l10n}
              amount={totalAmount}
              currency={currency}
              interval={interval}
              locale={locale}
            />
          </p>
        </li>
      </ul>

      {!!oneTimeCharge && (
        <>
          <div className="border-b border-grey-200"></div>
          <div className="flex items-center justify-between gap-2 leading-5 text-base text-grey-600 mt-6 pb-6 font-semibold">
            <h3>
              {l10n.getString(
                'upgrade-purchase-details-prorated-upgrade',
                'Prorated Upgrade'
              )}
            </h3>
            <p
              className="overflow-hidden text-ellipsis whitespace-nowrap"
              data-testid="prorated-price"
            >
              {l10n.getLocalizedCurrencyString(oneTimeCharge, currency, locale)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default UpgradePurchaseDetails;
