import { Invoice } from '@fxa/payments/cart';
import {
  getBundle,
  getFormattedMsg,
  getLocalizedCurrency,
  getLocalizedCurrencyString,
} from '@fxa/shared/l10n/fluent';
import { headers } from 'next/headers';
import Image from 'next/image';
import { formatPlanPricing } from '../utils/helpers';

export type PurchaseDetailsProps = {
  interval: string;
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

  // TODO - Temporary
  // Identify an approach to ensure we don't have to perform this logic
  // in every component/page that requires localization.
  const languages = headers()
    .get('Accept-Language')
    ?.split(',')
    .map((language) => language.split(';')[0]);

  // TODO
  // Move to instantiation on start up. Ideally getBundle's, generateBundle, is only called once at startup,
  // and then that instance is used for all requests.
  // Approach 1 (Experimental): https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
  // Approach 2 (Node global): https://github.com/vercel/next.js/blob/canary/examples/with-knex/knex/index.js#L13
  const l10n = await getBundle(languages);

  return (
    <div
      className={`component-card px-4 rounded-t-none tablet:rounded-t-lg`}
      data-testid="plan-details-component"
    >
      <div className="plan-details-header row-divider-grey-200">
        <div className="plan-details-logo-wrap" style={{}}>
          <Image
            src={webIcon}
            alt={productName}
            data-testid="product-logo"
            className="plan-details-icon"
            width={64}
            height={64}
          />
        </div>

        <div className="text-start text-sm">
          <h2 id="plan-details-product" className="plan-details-product">
            {productName}
          </h2>

          <p className="plan-details-description">
            {getFormattedMsg(
              l10n,
              `plan-price-interval-${interval}`,
              formatPlanPricing(listAmount, currency, interval),
              {
                amount: getLocalizedCurrency(listAmount, currency),
              }
            )}
            &nbsp;&bull;&nbsp;
            <span>{subtitle}</span>
          </p>
        </div>
      </div>

      <div data-testid="list">
        <h3 className="text-sm text-grey-600 font-semibold my-4">
          {l10n.getMessage('plan-details-header')?.value?.toString() ||
            `Plan Details`}
        </h3>

        <ul className="row-divider-grey-200 text-grey-400 m-0 px-3 text-sm list-disc">
          {details.map((detail, idx) => (
            <li className="mb-4 leading-5 marker:text-xs" key={idx}>
              {detail}
            </li>
          ))}
        </ul>
      </div>
      <div className="row-divider-grey-200 py-6">
        {!!listAmount && (
          <div className="plan-details-item">
            <div>
              {l10n.getMessage('plan-details-list-price')?.value?.toString() ||
                `List Price`}
            </div>
            <div>
              {getFormattedMsg(
                l10n,
                `list-price`,
                getLocalizedCurrencyString(listAmount, currency),
                {
                  amount: getLocalizedCurrency(listAmount, currency),
                }
              )}
            </div>
          </div>
        )}

        {!!discountAmount && (
          <div className="plan-details-item">
            <div>
              {l10n.getMessage('coupon-promo-code')?.value?.toString() ||
                `Promo Code`}
            </div>
            <div>
              {getFormattedMsg(
                l10n,
                `coupon-amount`,
                `- ${getLocalizedCurrencyString(discountAmount, currency)}`,
                {
                  amount: getLocalizedCurrency(discountAmount, currency),
                }
              )}
            </div>
          </div>
        )}

        {exclusiveTaxRates.length === 1 && (
          <div className="plan-details-item">
            <div>
              {l10n.getMessage('plan-details-tax')?.value?.toString() ||
                `Taxes and Fees`}
            </div>
            <div data-testid="tax-amount">
              {getFormattedMsg(
                l10n,
                `tax`,
                getLocalizedCurrencyString(
                  exclusiveTaxRates[0].amount,
                  currency
                ),
                {
                  amount: getLocalizedCurrency(
                    exclusiveTaxRates[0].amount,
                    currency
                  ),
                }
              )}
            </div>
          </div>
        )}

        {exclusiveTaxRates.length > 1 &&
          exclusiveTaxRates.map((taxRate, idx) => (
            <div className="plan-details-item">
              <div>{taxRate.title}</div>
              <div>
                {getFormattedMsg(
                  l10n,
                  `tax`,
                  getLocalizedCurrencyString(taxRate.amount, currency),
                  {
                    amount: getLocalizedCurrency(taxRate.amount, currency),
                  }
                )}
              </div>
            </div>
          ))}
      </div>

      <div className="pt-4 pb-6">
        <div className="plan-details-item font-semibold">
          <div className="total-label">
            {l10n.getMessage('plan-details-total-label')?.value?.toString() ||
              `Total`}
          </div>
          <div
            className="total-price"
            title={`${totalAmount}`}
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
          </div>
        </div>
      </div>
      {/* TODO - Add InfoBox as part of Coupon Form - Consider adding as child component */}
    </div>
  );
}

export default PurchaseDetails;
