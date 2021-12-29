import React, { useState, useContext } from 'react';
import { Localized } from '@fluent/react';
import {
  getLocalizedCurrency,
  formatPlanPricing,
  getLocalizedCurrencyString,
} from '../../lib/formats';
import {
  metadataFromPlan,
  productDetailsFromPlan,
} from 'fxa-shared/subscriptions/metadata';
import { AppContext } from '../../lib/AppContext';

// this is a fallback incase webIconURL is undefined,
// this is a rare case, but it also keeps typescript
// happy
import ffLogo from '../../images/firefox-logo.svg';

import './index.scss';
import { Plan } from '../../store/types';
import { Coupon } from '../../lib/Coupon';

type PlanDetailsProps = {
  selectedPlan: Plan;
  isMobile: boolean;
  showExpandButton?: boolean;
  className?: string;
  coupon?: Coupon;
};

export const PlanDetails = ({
  selectedPlan,
  isMobile,
  showExpandButton = false,
  className = 'default',
  coupon,
}: PlanDetailsProps) => {
  const { config } = useContext(AppContext);
  const { navigatorLanguages } = useContext(AppContext);
  const [detailsHidden, setDetailsState] = useState(showExpandButton);
  const { product_name, amount, currency, interval, interval_count } =
    selectedPlan;
  const { webIconURL, webIconBackground } = metadataFromPlan(selectedPlan);
  const productDetails = productDetailsFromPlan(
    selectedPlan,
    navigatorLanguages
  );
  const role = isMobile ? undefined : 'complementary';
  const setWebIconBackground = webIconBackground
    ? { background: webIconBackground }
    : '';

  const discountAmount =
    coupon && amount && config.featureFlags.subscriptionCoupons
      ? amount - coupon.amount
      : amount;
  const planPrice = formatPlanPricing(
    discountAmount,
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
              <div
                className="plan-details-logo-wrap"
                style={{ ...setWebIconBackground }}
              >
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
                <p className="plan-details-description">
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
                  <span className="plan-details-subtitle">
                    {productDetails.subtitle}
                  </span>
                </p>
              </div>
            </div>
          </div>
          {!detailsHidden && productDetails.details ? (
            <div className="plan-details-list" data-testid="list">
              <Localized id="plan-details-header">
                <h4>Product details</h4>
              </Localized>
              <ul>
                {productDetails.details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
              <div
                className="plan-details-total"
                aria-labelledby="plan-details-product"
              >
                {coupon && config.featureFlags.subscriptionCoupons ? (
                  <div className="plan-details-coupon-details">
                    <div className="plan-details-total-inner">
                      <Localized id="plan-details-list-price">
                        <div>List Price</div>
                      </Localized>
                      <div>
                        <Localized
                          id={`list-price`}
                          attrs={{ title: true }}
                          vars={{
                            amount: getLocalizedCurrency(amount, currency),
                            intervalCount: interval_count,
                          }}
                        >
                          {getLocalizedCurrencyString(amount, currency)}
                        </Localized>
                      </div>
                    </div>
                    <div className="plan-details-total-inner">
                      <Localized id="coupon-discount">
                        <div>Discount</div>
                      </Localized>
                      <div>
                        <Localized
                          id={`coupon-amount`}
                          attrs={{ title: true }}
                          vars={{
                            amount: getLocalizedCurrency(
                              coupon.amount,
                              currency
                            ),
                            intervalCount: interval_count,
                          }}
                        >{`- ${getLocalizedCurrencyString(
                          coupon.amount,
                          currency
                        )}`}</Localized>
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="plan-details-total-inner">
                  <Localized id="plan-details-total-label">
                    <p className="label">Total</p>
                  </Localized>
                  <Localized
                    id={`plan-price-${interval}`}
                    data-testid="plan-price-total"
                    attrs={{ title: true }}
                    vars={{
                      amount:
                        coupon && config.featureFlags.subscriptionCoupons
                          ? getLocalizedCurrency(
                              amount ? amount - coupon.amount : amount,
                              currency
                            )
                          : getLocalizedCurrency(amount, currency),
                      intervalCount: interval_count,
                    }}
                  >
                    <p
                      className="total-price"
                      title={planPrice}
                      data-testid="total-price"
                      id="total-price"
                    >
                      {planPrice}
                    </p>
                  </Localized>
                </div>
                {coupon ? (
                  <Localized id="coupon-success">
                    <div className="coupon-info" data-testid="coupon-success">
                      Your plan will automatically renew at the list price.
                    </div>
                  </Localized>
                ) : null}
              </div>
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
      </div>
    </section>
  );
};

export default PlanDetails;
