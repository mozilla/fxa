import React, { useState } from 'react';
import { Localized } from '@fluent/react';
import { getLocalizedCurrency, formatPlanPricing } from '../../lib/formats';
import { metadataFromPlan } from '../../store/utils';

// this is a fallback incase webIconURL is undefined,
// this is a rare case, but it also keeps typescript
// happy
import ffLogo from '../../images/firefox-logo.svg';

import './index.scss';
import { Plan } from '../../store/types';

type PlanDetailsProps = {
  selectedPlan: Plan;
  isMobile: boolean;
  showExpandButton?: boolean;
  className?: string;
};

export const PlanDetails = ({
  selectedPlan,
  isMobile,
  showExpandButton = false,
  className = 'default',
}: PlanDetailsProps) => {
  const [detailsHidden, setDetailsState] = useState(showExpandButton);
  const {
    product_name,
    amount,
    currency,
    interval,
    interval_count,
  } = selectedPlan;
  const { webIconURL } = metadataFromPlan(selectedPlan);

  const role = isMobile ? undefined : 'complementary';

  const planPrice = formatPlanPricing(
    amount,
    currency,
    interval,
    interval_count
  );

  return (
    <section
      className={`plan-details-component ${className}`}
      {...{ role }}
      data-testid="plan-details-component"
    >
      <div className="plan-details-component-inner">
        <div
          className={`container card plan-details-component-card ${className}`}
        >
          <div className="plan-details-header">
            <div className="plan-details-header-wrap">
              <div className="plan-details-logo-wrap">
                <img
                  src={webIconURL || ffLogo}
                  alt={product_name}
                  data-testid="product-logo"
                />
              </div>
              <div className="plan-details-heading-wrap">
                <h3 id="plan-details-product" className="plan-details-product">
                  {product_name}
                </h3>
                <p className="plan-details-description">Full-device VPN</p>
              </div>
            </div>
            <Localized
              id={`plan-price-${interval}`}
              $amount={getLocalizedCurrency(amount, currency)}
              $intervalCount={interval_count}
            >
              <p>{planPrice}</p>
            </Localized>
          </div>
          {!detailsHidden ? (
            <div className="plan-details-list" data-testid="list">
              <Localized id="plan-details-header">
                <h4>Product details</h4>
              </Localized>
              <ul>
                <li>
                  <Localized id="fpn-details-1">
                    <span></span>
                  </Localized>
                </li>
                <li>
                  <Localized id="fpn-details-2">
                    <span></span>
                  </Localized>
                </li>
                <li>
                  <Localized id="fpn-details-3">
                    <span></span>
                  </Localized>
                </li>
                <li>
                  <Localized id="fpn-details-4">
                    <span></span>
                  </Localized>
                </li>
              </ul>
            </div>
          ) : null}
          {showExpandButton ? (
            <div className="footer" data-testid="footer">
              {detailsHidden ? (
                <Localized id="plan-details-show-button">
                  <button
                    data-testid="button"
                    className="btn arrow"
                    aria-expanded={!detailsHidden}
                    onClick={() => setDetailsState(false)}
                  >
                    Show details
                  </button>
                </Localized>
              ) : (
                <Localized id="plan-details-hide-button">
                  <button
                    data-testid="button"
                    className="btn arrow up-arrow"
                    aria-expanded={!detailsHidden}
                    onClick={() => setDetailsState(true)}
                  >
                    Hide details
                  </button>
                </Localized>
              )}
            </div>
          ) : null}
        </div>
        {!showExpandButton ? (
          <div
            className="plan-details-total"
            aria-labelledby="plan-details-product"
          >
            <div className="plan-details-total-inner">
              <Localized id="plan-details-total-label">
                <p className="label">Total</p>
              </Localized>
              <Localized
                id={`plan-price-${interval}`}
                $amount={getLocalizedCurrency(amount, currency)}
                $intervalCount={interval_count}
              >
                <p className="total-price">{planPrice}</p>
              </Localized>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default PlanDetails;
