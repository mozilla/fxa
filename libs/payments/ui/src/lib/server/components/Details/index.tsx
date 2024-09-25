/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Image from 'next/image';
import { Invoice } from '@fxa/payments/cart';
import { PriceInterval } from '@fxa/payments/ui/server';
import infoLogo from '@fxa/shared/assets/images/info.svg';
import { LocalizerRsc } from '@fxa/shared/l10n/server';

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

type DetailsProps = {
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

export async function Details(props: DetailsProps) {
  const { purchaseDetails, invoice, interval, l10n } = props;
  const {
    currency,
    listAmount,
    discountAmount,
    discountEnd,
    discountType,
    totalAmount,
    taxAmounts,
  } = invoice;
  const { details } = purchaseDetails;
  const exclusiveTaxRates = taxAmounts.filter(
    (taxAmount) => !taxAmount.inclusive
  );

  return (
    <>
      <h3 className="text-grey-600 font-semibold my-4">
        {l10n.getString('next-plan-details-header', 'Plan Details')}
      </h3>

      <ul className="border-b border-grey-200 text-grey-400 m-0 px-3 list-disc">
        {details.map((detail, idx) => (
          <li className="mb-4 leading-5 marker:text-xs" key={idx}>
            {detail}
          </li>
        ))}
      </ul>

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

        <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 text-sm mt-6 pt-4 pb-6 font-semibold border-t border-grey-200">
          <h3 className="text-base">
            {l10n.getString('next-plan-details-total-label', 'Total')}
          </h3>
          <span
            className="overflow-hidden text-ellipsis text-lg whitespace-nowrap"
            data-testid="total-price"
            id="total-price"
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
      </ul>

      {!discountType || discountType === 'forever' ? null : discountEnd ? (
        <div
          className="flex items-center justify-center gap-2 text-green-900 pt-2 pb-6 font-medium"
          data-testid="coupon-success-with-date"
        >
          <Image src={infoLogo} alt="" />
          <div>
            {l10n.getString(
              'next-coupon-success-repeating',
              {
                couponDurationDate: l10n.getLocalizedDateString(
                  discountEnd,
                  true
                ),
              },
              `Your plan will automatically renew after ${l10n.getLocalizedDateString(
                discountEnd,
                true
              )} at the list price.`
            )}
          </div>
        </div>
      ) : (
        <div
          className="flex items-center justify-center gap-2 text-green-900 pt-2 pb-6 font-medium"
          data-testid="coupon-success"
        >
          <Image src={infoLogo} alt="" />
          <div>
            {l10n.getString(
              'next-coupon-success',
              'Your plan will automatically renew at the list price.'
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Details;
