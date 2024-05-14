/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Invoice } from '@fxa/payments/cart';
import Image from 'next/image';
import { formatPlanPricing } from '../utils/helpers';
import { LocalizerRsc } from '@fxa/shared/l10n/server';
import '../../styles/index.css';

type ListLabelItemProps = {
  labelLocalizationId: string;
  labelFallbackText: string;
  amount: number;
  currency: string;
  l10n: LocalizerRsc;
  positiveAmount?: boolean;
};
export const ListLabelItem = ({
  l10n,
  labelLocalizationId,
  labelFallbackText,
  amount,
  currency,
  positiveAmount = true,
}: ListLabelItemProps) => {
  return (
    <li className="plan-details-item">
      {l10n.getString(labelLocalizationId, labelFallbackText)}
      <div>
        {positiveAmount
          ? l10n.getString(
              `list-positive-amount`,
              {
                amount: l10n.getLocalizedCurrency(amount, currency),
              },
              `${l10n.getLocalizedCurrencyString(amount, currency)}`
            )
          : l10n.getString(
              `list-negative-amount`,
              {
                amount: l10n.getLocalizedCurrency(amount, currency),
              },
              `- ${l10n.getLocalizedCurrencyString(amount, currency)}`
            )}
      </div>
    </li>
  );
};

type PurchaseDetailsProps = {
  l10n: LocalizerRsc;
  interval: string;
  invoice: Invoice;
  purchaseDetails: {
    details: string[];
    subtitle: string | null;
    productName: string;
    webIcon: string;
  };
};

export async function PurchaseDetails(props: PurchaseDetailsProps) {
  const { purchaseDetails, invoice, interval, l10n } = props;
  const { currency, listAmount, discountAmount, totalAmount, taxAmounts } =
    invoice;
  const { details, subtitle, productName, webIcon } = purchaseDetails;
  const exclusiveTaxRates = taxAmounts.filter(
    (taxAmount) => !taxAmount.inclusive
  );

  return (
    <div className="component-card text-sm px-4 rounded-t-none tablet:rounded-t-lg">
      <div className="flex gap-4 my-0 py-4 row-divider-grey-200">
        <Image
          src={webIcon}
          alt={productName}
          data-testid="product-logo"
          className="w-16 h-16 rounded-lg"
          width={64}
          height={64}
        />

        <div className="text-start">
          <h2
            id="plan-details-product"
            className="text-grey-600 font-semibold leading-5 my-0 break-words"
          >
            {productName}
          </h2>

          <p className="text-grey-400 mt-1 mb-0">
            {l10n.getString(
              `plan-price-interval-${interval}`,
              {
                amount: l10n.getLocalizedCurrency(listAmount, currency),
              },
              formatPlanPricing(listAmount, currency, interval)
            )}
            &nbsp;&bull;&nbsp;
            {subtitle}
          </p>
        </div>
      </div>

      <h3 className="text-grey-600 font-semibold my-4">
        {l10n.getString('next-plan-details-header', 'Plan Details')}
      </h3>

      <ul className="row-divider-grey-200 text-grey-400 m-0 px-3 list-disc">
        {details.map((detail, idx) => (
          <li className="mb-4 leading-5 marker:text-xs" key={idx}>
            {detail}
          </li>
        ))}
      </ul>

      <ul className="row-divider-grey-200 py-6">
        {!!listAmount && (
          <ListLabelItem
            {...{
              labelLocalizationId: 'next-plan-details-list-price',
              labelFallbackText: 'List Price',
              amount: listAmount,
              currency,
              l10n,
            }}
          />
        )}

        {!!discountAmount && (
          <ListLabelItem
            {...{
              labelLocalizationId: 'next-coupon-promo-code',
              labelFallbackText: 'Promo Code',
              amount: discountAmount,
              currency,
              l10n,
              positiveAmount: false,
            }}
          />
        )}

        {exclusiveTaxRates.length === 1 && (
          <ListLabelItem
            {...{
              labelLocalizationId: 'next-plan-details-tax',
              labelFallbackText: 'Taxes and Fees',
              amount: exclusiveTaxRates[0].amount,
              currency,
              l10n,
            }}
          />
        )}

        {exclusiveTaxRates.length > 1 &&
          exclusiveTaxRates.map((taxRate) => (
            <ListLabelItem
              {...{
                labelLocalizationId: '',
                labelFallbackText: taxRate.title,
                amount: taxRate.amount,
                currency,
                l10n,
              }}
              key={taxRate.title}
            />
          ))}
      </ul>

      <div className="plan-details-item pt-4 pb-6 font-semibold">
        <span className="text-base">
          {l10n.getString('next-plan-details-total-label', 'Total')}
        </span>
        <span
          className="overflow-hidden text-ellipsis text-lg whitespace-nowrap"
          data-testid="total-price"
          id="total-price"
        >
          {l10n.getString(
            `plan-price-interval-${interval}`,
            {
              amount: l10n.getLocalizedCurrency(totalAmount, currency),
            },
            formatPlanPricing(totalAmount, currency, interval)
          )}
        </span>
      </div>
      {/* TODO - Add InfoBox as part of Coupon Form - Consider adding as child component */}
    </div>
  );
}

export default PurchaseDetails;
