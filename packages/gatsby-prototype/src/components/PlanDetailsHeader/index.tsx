import React from 'react';
import { Localized } from '@fluent/react';

import { formatPlanPricing, getLocalizedCurrency } from '../../lib/formats';
import { Plan } from '../../lib/types';

import ffLogo from '../../images/firefox-logo.svg';

export type PlanDetailsHeaderProps = {
  selectedPlan: Plan;
  className?: string;
};

const PlanDetailsHeader = ({
  selectedPlan,
  className = '',
}: PlanDetailsHeaderProps) => {
  const {
    amount,
    currency,
    interval,
    interval_count,
    productName,
    subtitle,
    webIconUrl,
  } = selectedPlan;

  const planPrice = formatPlanPricing(
    amount,
    currency,
    interval,
    interval_count
  );

  let webIcon;

  const checkImage =
    /([|.|\w|\s|-])*\.(?:jpe?g|gif|png|svg|JPE?G|GIF|PNG|SVG)$/;

  checkImage.test(webIconUrl) ? (webIcon = webIconUrl) : (webIcon = ffLogo);

  return (
    <div
      className={`flex gap-4 my-0 py-4 border-b border-0 border-solid border-grey-200 ${className}`}
    >
      <div
        className="flex h-16 items-center justify-center rounded-lg shrink-0 w-16"
        // style={{ ...setWebIconBackground }}
      >
        <img
          src={webIcon}
          alt={productName}
          data-testid="product-logo"
          className="plan-details-icon"
        />
      </div>

      <div className="text-start">
        <h2 id="plan-details-product" className="plan-details-product">
          {productName}
        </h2>

        <p className="plan-details-description">
          <Localized
            id={`plan-price-interval-${interval}`}
            vars={{
              amount: getLocalizedCurrency(amount, currency),
              intervalCount: interval_count,
            }}
          >
            {planPrice}
          </Localized>
          &nbsp;&bull;&nbsp;
          <span>{subtitle}</span>
        </p>
      </div>
    </div>
  );
};

export default PlanDetailsHeader;
