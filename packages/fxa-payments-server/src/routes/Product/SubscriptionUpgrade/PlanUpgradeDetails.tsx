import React, { useContext } from 'react';
import { Localized } from '@fluent/react';
import { getLocalizedCurrency, formatPlanPricing } from '../../../lib/formats';
import {
  uiContentFromProductConfig,
  webIconConfigFromProductConfig,
} from 'fxa-shared/subscriptions/configuration/utils';
import { AppContext } from '../../../lib/AppContext';

import ffLogo from '../../../images/firefox-logo.svg';

import './index.scss';
import { Plan } from '../../../store/types';

export const PlanUpgradeDetails = ({
  selectedPlan,
  upgradeFromPlan,
  isMobile,
  className = 'default',
}: {
  selectedPlan: Plan;
  upgradeFromPlan: Plan;
  isMobile: boolean;
  className?: string;
}) => {
  const totalPrice = formatPlanPricing(
    selectedPlan.amount,
    selectedPlan.currency,
    selectedPlan.interval,
    selectedPlan.interval_count
  );

  const role = isMobile ? undefined : 'complementary';

  return (
    <section
      className={`plan-upgrade-details-component mt-6 tablet:max-w-xs ${className}`}
      {...{ role }}
      data-testid="plan-upgrade-details-component"
    >
      <p className="plan-label current-plan-label">
        <Localized id="sub-update-current-plan-label">Current plan</Localized>
      </p>

      <PlanDetailsCard className="from-plan" plan={upgradeFromPlan} />

      <p className="plan-label new-plan-label">
        <Localized id="sub-update-new-plan-label">New plan</Localized>
      </p>

      <PlanDetailsCard className="to-plan" plan={selectedPlan} />

      <div className="py-6 border-t-0 plan-details-item font-semibold">
        <Localized id="sub-update-total-label">
          <div className="total-label">New total</div>
        </Localized>

        <Localized
          id={`plan-price-${selectedPlan.interval}`}
          vars={{
            amount: getLocalizedCurrency(
              selectedPlan.amount,
              selectedPlan.currency
            ),
            intervalCount: selectedPlan.interval_count,
          }}
        >
          <div className="total-price">{totalPrice}</div>
        </Localized>
      </div>
    </section>
  );
};

export const PlanDetailsCard = ({
  plan,
  className = '',
}: {
  plan: Plan;
  className?: string;
}) => {
  const { navigatorLanguages, config } = useContext(AppContext);
  const { product_name, amount, currency, interval, interval_count } = plan;
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
  const planPrice = formatPlanPricing(
    amount,
    currency,
    interval,
    interval_count
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
          <Localized
            id={`plan-price-${interval}`}
            vars={{
              amount: getLocalizedCurrency(amount, currency),
              intervalCount: interval_count,
            }}
          >
            {planPrice}
          </Localized>
          &nbsp;&bull;&nbsp;
          {productDetails.subtitle}
        </p>
      </div>
    </div>
  );
};

export default PlanUpgradeDetails;
