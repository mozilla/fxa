import { Invoice } from '@fxa/payments/cart';
import {
  getBundle,
  getFormattedMsg,
  getLocalizedCurrency,
  getLocalizedCurrencyString,
} from '@fxa/shared/l10n';
import { FluentBundle } from '@fluent/bundle';
import Image from 'next/image';
import { formatPlanPricing } from '../utils/helpers';
import '../../styles/index.css';

type ListLabelItemProps = {
  labelLocalizationId: string;
  labelFallbackText: string;
  amount: number;
  currency: string;
  l10n: FluentBundle;
  positiveAmount?: boolean;
};

export const ListLabelItem = ({
  labelLocalizationId,
  labelFallbackText,
  amount,
  currency,
  l10n,
  positiveAmount = true,
}: ListLabelItemProps) => {
  return (
    <li className="plan-details-item">
      {l10n.getMessage(labelLocalizationId)?.value?.toString() ||
        labelFallbackText}
      <div>
        {positiveAmount
          ? getFormattedMsg(
              l10n,
              `list-positive-amount`,
              `${getLocalizedCurrencyString(amount, currency)}`,
              {
                amount: getLocalizedCurrency(amount, currency),
              }
            )
          : getFormattedMsg(
              l10n,
              `list-negative-amount`,
              `- ${getLocalizedCurrencyString(amount, currency)}`,
              {
                amount: getLocalizedCurrency(amount, currency),
              }
            )}
      </div>
    </li>
  );
};

type PurchaseDetailsProps = {
  interval: string;
  locale: string;
  invoice: Invoice;
  purchaseDetails: {
    details: string[];
    subtitle?: string;
    productName: string;
    webIcon: string;
  };
};

export async function PurchaseDetails(props: PurchaseDetailsProps) {
  const { purchaseDetails, invoice, interval } = props;
  const { currency, listAmount, discountAmount, totalAmount, taxAmounts } =
    invoice;
  const { details, subtitle, productName, webIcon } = purchaseDetails;
  const exclusiveTaxRates = taxAmounts.filter(
    (taxAmount) => !taxAmount.inclusive
  );

  // TODO
  // Move to instantiation on start up. Ideally getBundle's, generateBundle, is only called once at startup,
  // and then that instance is used for all requests.
  // Approach 1 (Experimental): https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
  // Approach 2 (Node global): https://github.com/vercel/next.js/blob/canary/examples/with-knex/knex/index.js#L13
  const l10n = await getBundle([props.locale]);

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
            {getFormattedMsg(
              l10n,
              `plan-price-interval-${interval}`,
              formatPlanPricing(listAmount, currency, interval),
              {
                amount: getLocalizedCurrency(listAmount, currency),
              }
            )}
            &nbsp;&bull;&nbsp;
            {subtitle}
          </p>
        </div>
      </div>

      <h3 className="text-grey-600 font-semibold my-4">
        {l10n.getMessage('next-plan-details-header')?.value?.toString() ||
          `Plan Details`}
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
              subtractValue: true,
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
          exclusiveTaxRates.map((taxRate, idx) => (
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
          {l10n
            .getMessage('next-plan-details-total-label')
            ?.value?.toString() || `Total`}
        </span>
        <span
          className="overflow-hidden text-ellipsis text-lg whitespace-nowrap"
          data-testid="total-price"
          id="total-price"
        >
          {getFormattedMsg(
            l10n,
            `plan-price-interval-${interval}`,
            formatPlanPricing(totalAmount, currency, interval),
            {
              amount: getLocalizedCurrency(totalAmount, currency),
            }
          )}
        </span>
      </div>
      {/* TODO - Add InfoBox as part of Coupon Form - Consider adding as child component */}
    </div>
  );
}

export default PurchaseDetails;
