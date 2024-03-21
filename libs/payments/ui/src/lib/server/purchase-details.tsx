import { Invoice } from '@fxa/payments/cart';
import {
  getLocalizedCurrency,
  getLocalizedCurrencyString,
} from '@fxa/shared/l10n';
import Image from 'next/image';
import { formatPlanPricing } from '../utils/helpers';
import '../../styles/index.css';
import { app } from '@fxa/payments/ui/server';

type ListLabelItemProps = {
  labelText: string;
  amountText: string;
};

export const ListLabelItem = ({
  labelText,
  amountText,
}: ListLabelItemProps) => {
  return (
    <li className="plan-details-item">
      {labelText}
      <div>{amountText}</div>
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
  const { purchaseDetails, invoice, interval, locale } = props;
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
  //const l10n = await getBundle([props.locale]);
  const zl10n = await app.getLocalizerServer();

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
            {zl10n.getFormattedMsg(
              locale,
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
        {zl10n.getFormattedMsg(
          locale,
          'next-plan-details-header',
          'Plan Details'
        )}
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
              labelText: zl10n.getFormattedMsg(
                locale,
                'next-plan-details-list-price',
                'List Price'
              ),
              amountText: zl10n.getFormattedMsg(
                locale,
                'list-postive-amount',
                `${getLocalizedCurrencyString(listAmount, currency)}`,
                {
                  amount: getLocalizedCurrency(listAmount, currency),
                }
              ),
            }}
          />
        )}

        {!!discountAmount && (
          <ListLabelItem
            {...{
              labelText: zl10n.getFormattedMsg(
                locale,
                'next-coupon-promo-code',
                'Promo Code'
              ),
              amountText: zl10n.getFormattedMsg(
                locale,
                'list-negative-amount',
                `- ${getLocalizedCurrencyString(discountAmount, currency)}`,
                {
                  amount: getLocalizedCurrency(discountAmount, currency),
                }
              ),
            }}
          />
        )}

        {exclusiveTaxRates.length === 1 && (
          <ListLabelItem
            {...{
              labelText: zl10n.getFormattedMsg(
                locale,
                'next-plan-details-tax',
                'Taxes and Fees'
              ),
              amountText: zl10n.getFormattedMsg(
                locale,
                'list-positive-amount',
                `${getLocalizedCurrencyString(
                  exclusiveTaxRates[0].amount,
                  currency
                )}`,
                {
                  amount: getLocalizedCurrency(
                    exclusiveTaxRates[0].amount,
                    currency
                  ),
                }
              ),
            }}
          />
        )}

        {exclusiveTaxRates.length > 1 &&
          exclusiveTaxRates.map((taxRate, idx) => (
            <ListLabelItem
              {...{
                labelText: zl10n.getFormattedMsg(locale, '', taxRate.title),
                amountText: zl10n.getFormattedMsg(
                  locale,
                  'list-positive-amount',
                  `${getLocalizedCurrencyString(taxRate.amount, currency)}`,
                  {
                    amount: getLocalizedCurrency(taxRate.amount, currency),
                  }
                ),
              }}
              key={taxRate.title}
            />
          ))}
      </ul>

      <div className="plan-details-item pt-4 pb-6 font-semibold">
        <span className="text-base">
          {zl10n.getFormattedMsg(
            locale,
            'next-plan-details-total-label',
            'Total'
          )}
        </span>
        <span
          className="overflow-hidden text-ellipsis text-lg whitespace-nowrap"
          data-testid="total-price"
          id="total-price"
        >
          {zl10n.getFormattedMsg(
            locale,
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
