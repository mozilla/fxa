/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Invoice } from '@fxa/payments/cart';
import { PriceInterval } from '@fxa/payments/ui/server';
import { LocalizerRsc } from '@fxa/shared/l10n/server';

type ListLabelItemProps = {
  labelLocalizationId: string;
  labelFallbackText: string;
  amount: number;
  currency: string;
  l10n: LocalizerRsc;
  positiveAmount?: boolean;
};

const ListLabelItem = ({
  l10n,
  labelLocalizationId,
  labelFallbackText,
  amount,
  currency,
  positiveAmount = true,
}: ListLabelItemProps) => {
  return (
    <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 text-sm">
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

type PriceItemizedProps = {
  l10n: LocalizerRsc;
  interval: string;
  invoice: Invoice;
};

export async function PriceItemized(props: PriceItemizedProps) {
  const { invoice, interval, l10n } = props;
  const {
    currency,
    listAmount,
    discountAmount,
    totalAmount,
    taxAmounts,
    oneTimeCharge,
  } = invoice;
  const exclusiveTaxRates = taxAmounts.filter(
    (taxAmount) => !taxAmount.inclusive
  );

  return (
    <ul className="pt-6">
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

      {!oneTimeCharge && <div className="border-t border-grey-200 mt-6"></div>}

      <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 text-sm mt-6 pt-4 pb-6 font-semibold">
        <h3 className="text-base">
          {oneTimeCharge
            ? l10n.getString('next-sub-update-total-label', 'New total')
            : l10n.getString('next-plan-details-total-label', 'Total')}
        </h3>
        <span
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
        </span>
      </li>

      {oneTimeCharge && (
        <>
          <div className="border-b border-grey-200"></div>

          <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 text-sm mt-6 pb-6 font-semibold">
            <h3 className="text-base">
              {l10n.getString(
                'next-sub-update-prorated-upgrade',
                'Prorated Upgrade'
              )}
            </h3>
            <span
              className="overflow-hidden text-ellipsis text-lg whitespace-nowrap"
              data-testid="prorated-price"
            >
              <PriceInterval
                l10n={l10n}
                currency={currency}
                interval={interval}
                listAmount={oneTimeCharge}
                totalAmount={oneTimeCharge}
              />
            </span>
          </li>
        </>
      )}
    </ul>
  );
}

export default PriceItemized;
