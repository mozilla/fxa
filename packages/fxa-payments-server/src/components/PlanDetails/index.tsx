import React, { useState, useContext } from 'react';
import { Localized } from '@fluent/react';
import {
  getLocalizedCurrency,
  formatPlanPricing,
  getLocalizedCurrencyString,
  getLocalizedDate,
} from '../../lib/formats';
import {
  uiContentFromProductConfig,
  webIconConfigFromProductConfig,
} from 'fxa-shared/subscriptions/configuration/utils';
import { AppContext } from '../../lib/AppContext';

// this is a fallback incase webIconURL is undefined,
// this is a rare case, but it also keeps typescript
// happy
import ffLogo from '../../images/firefox-logo.svg';
import infoLogo from './images/Information.svg';

import './index.scss';
import { Plan } from '../../store/types';
import { CouponDetails } from 'fxa-shared/dto/auth/payments/coupon';
import { useInfoBoxMessage } from '../../lib/hooks';

export type PlanDetailsProps = {
  selectedPlan: Plan;
  isMobile: boolean;
  showExpandButton?: boolean;
  className?: string;
  coupon?: CouponDetails;
  children?: any;
};

export const PlanDetails = ({
  selectedPlan,
  isMobile,
  showExpandButton = false,
  coupon,
  children,
}: PlanDetailsProps) => {
  const { navigatorLanguages, config } = useContext(AppContext);
  const [detailsHidden, setDetailsState] = useState(showExpandButton);
  const { product_name, amount, currency, interval, interval_count } =
    selectedPlan;
  const { webIcon, webIconBackground } = webIconConfigFromProductConfig(
    selectedPlan,
    navigatorLanguages,
    config.featureFlags.useFirestoreProductConfigs
  );
  const productDetails = uiContentFromProductConfig(
    selectedPlan,
    navigatorLanguages,
    config.featureFlags.useFirestoreProductConfigs
  );
  const role = isMobile ? undefined : 'complementary';
  const setWebIconBackground = webIconBackground
    ? { background: webIconBackground }
    : '';

  const discountAmount =
    coupon && amount && coupon.discountAmount
      ? amount - coupon.discountAmount
      : amount;
  const planPrice = formatPlanPricing(
    discountAmount,
    currency,
    interval,
    interval_count
  );

  const infoBoxMessage = useInfoBoxMessage(coupon, selectedPlan);

  return (
    <div
      className="plan-details-component my-8 mx-0 p-0"
      {...{ role }}
      data-testid="plan-details-component"
    >
      <div className="plan-details-component-inner">
        <div className="plan-details-component-card">
          <div className="plan-details-header row-divider-grey-200">
            <div className="flex">
              <div
                className="plan-details-logo-wrap"
                style={{ ...setWebIconBackground }}
              >
                <img
                  src={webIcon || ffLogo}
                  alt={product_name}
                  data-testid="product-logo"
                  className="w-8 h-8"
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
                  <span>{productDetails.subtitle}</span>
                </p>
              </div>
            </div>
          </div>

          {!detailsHidden && productDetails.details && (
            <div className="mt-2 pt-0 px-4 pb-px tablet:border-b-0 text-left" data-testid="list">
              <Localized id="plan-details-header">
                <h4 className="text-sm text-grey-600 my-4 mx-0">Product details</h4>
              </Localized>

              <ul className="row-divider-grey-200 text-grey-400 m-0 pl-3">
                {productDetails.details.map((detail, idx) => (
                  <li className="mb-4 leading-5 marker:text-xs" key={idx}>
                    {detail}
                  </li>
                ))}
              </ul>

              <div className="plan-details-total">
                {coupon && coupon.discountAmount && (
                  <div className="row-divider-grey-200 mb-4 pb-6">
                    <div className="plan-details-total-inner">
                      <Localized id="plan-details-list-price">
                        <div>List Price</div>
                      </Localized>

                      <Localized
                        id={`list-price`}
                        attrs={{ title: true }}
                        vars={{
                          amount: getLocalizedCurrency(amount, currency),
                          intervalCount: interval_count,
                        }}
                      >
                      <div>
                        {getLocalizedCurrencyString(amount, currency)}
                      </div>
                      </Localized>
                    </div>

                    <div className="plan-details-total-inner">
                      <Localized id="coupon-discount">
                        <div>Discount</div>
                      </Localized>

                      <Localized
                        id={`coupon-amount`}
                        attrs={{ title: true }}
                        vars={{
                          amount: getLocalizedCurrency(
                            coupon.discountAmount,
                            currency
                          ),
                          intervalCount: interval_count,
                        }}
                      >
                        <div>
                          {`- ${getLocalizedCurrencyString(
                            coupon.discountAmount,
                            currency
                          )}`}
                        </div>
                      </Localized>
                    </div>
                  </div>
                )}

                <div className="plan-details-total-inner">
                  <Localized id="plan-details-total-label">
                    <div className="total-label">Total</div>
                  </Localized>

                  <Localized
                    id={`plan-price-${interval}`}
                    data-testid="plan-price-total"
                    attrs={{ title: true }}
                    vars={{
                      amount:
                        coupon && coupon.discountAmount
                          ? getLocalizedCurrency(
                              amount ? amount - coupon.discountAmount : amount,
                              currency
                            )
                          : getLocalizedCurrency(amount, currency),
                      intervalCount: interval_count,
                    }}
                  >
                    <div
                      className="total-price"
                      title={planPrice}
                      data-testid="total-price"
                      id="total-price"
                    >
                      {planPrice}
                    </div>
                  </Localized>
                </div>

                {infoBoxMessage && (
                  infoBoxMessage.couponDurationDate ? (
                    <div className="coupon-info" data-testid="coupon-success-with-date">
                      <img src={infoLogo} alt="" />

                      <Localized
                        id={infoBoxMessage.message}
                        vars={{
                          couponDurationDate: getLocalizedDate(
                            infoBoxMessage.couponDurationDate,
                            true
                          ),
                        }}
                      >
                        {infoBoxMessage.message}
                      </Localized>
                    </div>
                  ) : (
                    <div className="coupon-info" data-testid="coupon-success">
                      <img src={infoLogo} alt="" />

                      <Localized id={infoBoxMessage.message}>
                        {infoBoxMessage.message}
                      </Localized>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          { showExpandButton && (
            <div className="footer text-center" data-testid="footer">
              {detailsHidden ? (
                <Localized id="plan-details-show-button">
                  <button
                    data-testid="button"
                    className="accordion-btn arrow"
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
                    className="accordion-btn arrow before:rotate-180 up-arrow"
                    aria-expanded={!detailsHidden}
                    onClick={() => setDetailsState(true)}
                  >
                    Hide details
                  </button>
                </Localized>
              )}
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

export default PlanDetails;
