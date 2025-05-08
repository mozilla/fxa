import React, { useContext } from 'react';
import { Localized } from '@fluent/react';

import { AppContext } from '../../../lib/AppContext';
import { formatPlanInterval } from '../../../lib/formats';
import ffLogo from '../../../images/firefox-logo.svg';
import { Plan } from '../../../store/types';

import {
  uiContentFromProductConfig,
  webIconConfigFromProductConfig,
} from 'fxa-shared/subscriptions/configuration/utils';

import { FirstInvoicePreview } from 'fxa-shared/dto/auth/payments/invoice';
import './index.scss';
import { PriceDetails } from '../../../components/PriceDetails';

export const PlanUpgradeDetails = ({
  selectedPlan,
  upgradeFromPlan,
  isMobile,
  className = 'default',
  invoicePreview,
}: {
  selectedPlan: Plan;
  upgradeFromPlan: Plan;
  isMobile: boolean;
  invoicePreview: FirstInvoicePreview;
  className?: string;
}) => {
  const { navigatorLanguages, config } = useContext(AppContext);
  const invoiceCurrency = invoicePreview.line_items[0].currency;
  const { product_name, amount, interval, interval_count } =
    selectedPlan;
  const formattedInterval = formatPlanInterval({
    interval: interval,
    intervalCount: 1,
  });
  const productDetails = uiContentFromProductConfig(
    selectedPlan,
    navigatorLanguages,
    config.featureFlags.useFirestoreProductConfigs
  );

  const role = isMobile ? undefined : 'complementary';

  const showTax = config.featureFlags.useStripeAutomaticTax;

  const exclusiveTaxRates =
    invoicePreview.tax?.filter(
      (taxRate) => !taxRate.inclusive && taxRate.amount > 0
    ) || [];

  const totalAmount = showTax ? invoicePreview.total : amount;
  const subTotal = invoicePreview.subtotal;
  const oneTimeCharge = invoicePreview?.one_time_charge;

  return (
    <section
      className={`plan-upgrade-details-component pt-6 tablet:pt-0 ${className}`}
      {...{ role }}
      data-testid="plan-upgrade-details-component"
    >
      <p className="plan-label current-plan-label">
        <Localized id="sub-update-current-plan-label">Current plan</Localized>
      </p>

      <PlanDetailsCard className="from-plan" plan={upgradeFromPlan} currency={invoiceCurrency} />

      <p className="plan-label new-plan-label">
        <Localized id="sub-update-new-plan-label">New plan</Localized>
      </p>

      <PlanDetailsCard className="to-plan" plan={selectedPlan} currency={invoiceCurrency} />

      <div className="py-6 border-t-0">
        {showTax && !!subTotal && !!exclusiveTaxRates.length && (
          <>
            <div className="plan-details-item">
              <Localized
                id={`sub-update-new-plan-${formattedInterval}`}
                vars={{
                  productName: productDetails.name || product_name,
                }}
              >
                <div data-testid={`sub-update-new-plan-${formattedInterval}`}>
                  {productDetails.name || product_name} (
                  {formattedInterval.replace(/\w/, (firstLetter) =>
                    firstLetter.toUpperCase()
                  )}
                  )
                </div>
              </Localized>

              <PriceDetails
                total={subTotal}
                currency={invoiceCurrency}
                dataTestId="plan-upgrade-subtotal"
              />
            </div>

            {exclusiveTaxRates.length === 1 && (
              <div className="plan-details-item">
                <Localized id="plan-details-tax">
                  <div>Taxes and Fees</div>
                </Localized>

                <PriceDetails
                  total={exclusiveTaxRates[0].amount}
                  currency={invoiceCurrency}
                  dataTestId="plan-upgrade-tax-amount"
                />
              </div>
            )}
            {exclusiveTaxRates.length > 1 &&
              exclusiveTaxRates.map((taxRate, idx) => (
                <div className="plan-details-item" key={idx}>
                  <div>{taxRate.display_name}</div>

                  <PriceDetails
                    total={taxRate.amount}
                    currency={invoiceCurrency}
                    dataTestId="plan-upgrade-tax-amount"
                  />
                </div>
              ))}
          </>
        )}

        {!!totalAmount && (
          <div className="plan-details-item font-semibold mt-5">
            <Localized id="sub-update-total-label">
              <div className="total-label">New total</div>
            </Localized>

            <PriceDetails
              total={totalAmount}
              currency={invoiceCurrency}
              interval={interval}
              intervalCount={interval_count}
              className="total-price"
              dataTestId="total-price"
            />
          </div>
        )}

        {oneTimeCharge && (
          <>
            <hr className="m-0 my-5 unit-row-hr" />

            <div className="plan-details-item font-semibold mt-5">
              <Localized id="sub-update-prorated-upgrade">
                <div
                  className="total-label"
                  data-testid="sub-update-prorated-upgrade"
                >
                  Prorated Upgrade
                </div>
              </Localized>

              <PriceDetails
                total={oneTimeCharge}
                currency={invoiceCurrency}
                className="total-price"
                dataTestId="prorated-amount"
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export const PlanDetailsCard = ({
  plan,
  currency,
  className = '',
}: {
  plan: Plan;
  currency: string,
  className?: string;
}) => {
  const { navigatorLanguages, config } = useContext(AppContext);
  const { product_name, amount, interval, interval_count } = plan;
  const { webIcon, webIconBackground } = webIconConfigFromProductConfig(
    plan,
    navigatorLanguages,
    config.featureFlags.useFirestoreProductConfigs
  );
  const productDetails = uiContentFromProductConfig(
    plan,
    navigatorLanguages,
    config.featureFlags.useFirestoreProductConfigs
  );

  const setWebIconBackground = webIconBackground
    ? { background: webIconBackground }
    : '';

  return (
    <div
      className={`component-card plan-details-header px-4 rounded-t-lg ${className}`}
    >
      <div
        className="plan-details-logo-wrap"
        style={{ ...setWebIconBackground }}
      >
        <img
          src={webIcon || ffLogo}
          alt={productDetails.name || product_name}
          data-testid="product-logo"
          className="plan-details-icon"
        />
      </div>

      <div className="text-start">
        <h3
          id="plan-details-product"
          className="product-name plan-details-product"
        >
          {productDetails.name || product_name}
        </h3>

        {/* TODO: make this configurable, issue #4741 / FXA-1484 */}
        <p id="product-description" className="plan-details-description">
          <PriceDetails
            total={amount || 0}
            currency={currency}
            interval={interval}
            intervalCount={interval_count}
          />
          &nbsp;&bull;&nbsp;
          {productDetails.subtitle}
        </p>
      </div>
    </div>
  );
};

export default PlanUpgradeDetails;
