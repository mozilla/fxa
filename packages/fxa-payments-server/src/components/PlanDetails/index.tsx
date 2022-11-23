import React, { useState, useContext, useEffect, useRef } from 'react';
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
import arrowIcon from './images/chevron.svg';

import './index.scss';
import { Plan } from '../../store/types';
import { CouponDetails } from 'fxa-shared/dto/auth/payments/coupon';
import { useInfoBoxMessage } from '../../lib/hooks';
import { apiInvoicePreview } from '../../lib/apiClient';
import { LoadingSpinner } from '../LoadingSpinner';
import { FirstInvoicePreview } from 'fxa-shared/dto/auth/payments/invoice';

export type PlanDetailsProps = {
  selectedPlan: Plan;
  isMobile: boolean;
  showExpandButton?: boolean;
  className?: string;
  coupon?: CouponDetails;
  invoicePreview?: FirstInvoicePreview;
};

export const PlanDetails = ({
  className = '',
  selectedPlan,
  isMobile,
  showExpandButton = false,
  coupon,
  invoicePreview,
}: PlanDetailsProps) => {
  const { navigatorLanguages, config } = useContext(AppContext);
  const [detailsHidden, setDetailsState] = useState(showExpandButton);
  const { product_name, amount, currency, interval, interval_count } =
    selectedPlan;

  const [loading, setLoading] = useState(true);
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [totalPrice, setTotalPrice] = useState('');
  const invoice = useRef(invoicePreview);

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

  const infoBoxMessage = useInfoBoxMessage(coupon, selectedPlan);

  const planPrice = formatPlanPricing(
    amount,
    currency,
    interval,
    interval_count
  );

  useEffect(() => {
    (async () => {
      setLoading(true);

      const fallBack = () => {
        setSubTotal(amount!);
        if (coupon && coupon.discountAmount && amount) {
          setDiscountAmount(coupon.discountAmount);
          setTotalAmount(amount - coupon.discountAmount);
        } else {
          setDiscountAmount(0);
          setTotalAmount(amount!);
        }

        const price = formatPlanPricing(
          totalAmount as unknown as number,
          currency,
          interval,
          interval_count
        );

        setTotalPrice(price);
        setLoading(false);
      };

      try {
        if (!config.featureFlags.useStripeAutomaticTax) {
          fallBack();
          return;
        }

        if (!invoicePreview) {
          invoice.current = await apiInvoicePreview({
            priceId: selectedPlan.plan_id,
            promotionCode: coupon?.promotionCode as string,
          });
        }

        setSubTotal(invoice.current!.subtotal);
        setTotalAmount(invoice.current!.total);

        if (invoice.current!.tax && invoice.current?.tax.amount) {
          setTaxAmount(invoice.current!.tax.amount);
        } else {
          setTaxAmount(0);
        }

        if (invoice.current!.discount) {
          setDiscountAmount(invoice.current!.discount.amount);
        } else {
          setDiscountAmount(0);
        }

        const price = formatPlanPricing(
          totalAmount as unknown as number,
          currency,
          interval,
          interval_count
        );

        setTotalPrice(price);
        setLoading(false);
      } catch (e: any) {
        // gracefully fail/set the state according to the data we have
        // if previewInvoice errors or if stripe tax is not enabled
        fallBack();
      }
    })();
  }, [
    amount,
    config.featureFlags.useStripeAutomaticTax,
    coupon,
    currency,
    interval,
    interval_count,
    selectedPlan.plan_id,
    totalAmount,
    invoicePreview,
  ]);

  return (
    <div
      className={`component-card px-4 rounded-t-none tablet:rounded-t-lg ${className}`}
      {...{ role }}
      data-testid="plan-details-component"
    >
      <div className="plan-details-header row-divider-grey-200">
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
          <h3 id="plan-details-product" className="plan-details-product">
            {productDetails.name || product_name}
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

      {!detailsHidden && productDetails.details && (
        <>
          <div data-testid="list">
            <Localized id="plan-details-header">
              <h4 className="text-sm text-grey-600 my-4">Product details</h4>
            </Localized>

            <ul className="row-divider-grey-200 text-grey-400 m-0 px-3">
              {productDetails.details.map((detail, idx) => (
                <li className="mb-4 leading-5 marker:text-xs" key={idx}>
                  {detail}
                </li>
              ))}
            </ul>
          </div>

          {loading ? (
            <div className="pb-4">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <div className="row-divider-grey-200 py-6">
                {!!subTotal && (
                  <div className="plan-details-item">
                    <Localized id="plan-details-list-price">
                      <div>List Price</div>
                    </Localized>

                    <Localized
                      id={`list-price`}
                      attrs={{ title: true }}
                      vars={{
                        amount: getLocalizedCurrency(subTotal, currency),
                        intervalCount: interval_count,
                      }}
                    >
                      <div>
                        {getLocalizedCurrencyString(subTotal, currency)}
                      </div>
                    </Localized>
                  </div>
                )}

                {!!taxAmount && (
                  <div className="plan-details-item">
                    <Localized id="plan-details-tax">
                      <div>Taxes and Fees</div>
                    </Localized>

                    <Localized
                      id={`tax`}
                      attrs={{ title: true }}
                      vars={{
                        amount: getLocalizedCurrency(taxAmount, currency),
                        intervalCount: interval_count,
                      }}
                    >
                      <div>
                        {getLocalizedCurrencyString(taxAmount, currency)}
                      </div>
                    </Localized>
                  </div>
                )}

                {!!discountAmount && (
                  <div className="plan-details-item">
                    <Localized id="coupon-promo-code">
                      <div>Promo Code</div>
                    </Localized>

                    <Localized
                      id={`coupon-amount`}
                      attrs={{ title: true }}
                      vars={{
                        amount: getLocalizedCurrency(discountAmount, currency),
                        intervalCount: interval_count,
                      }}
                    >
                      <div>
                        {`- ${getLocalizedCurrencyString(
                          discountAmount,
                          currency
                        )}`}
                      </div>
                    </Localized>
                  </div>
                )}
              </div>

              <div className="pt-4 pb-6">
                {!!totalAmount && (
                  <div className="plan-details-item font-semibold">
                    <Localized id="plan-details-total-label">
                      <div className="total-label">Total</div>
                    </Localized>

                    <Localized
                      id={`plan-price-${interval}`}
                      data-testid="plan-price-total"
                      attrs={{ title: true }}
                      vars={{
                        amount: getLocalizedCurrency(totalAmount, currency),
                        intervalCount: interval_count,
                      }}
                    >
                      <div
                        className="total-price"
                        title={totalPrice}
                        data-testid="total-price"
                        id="total-price"
                      >
                        {totalPrice}
                      </div>
                    </Localized>
                  </div>
                )}

                {infoBoxMessage &&
                  (infoBoxMessage.couponDurationDate ? (
                    <div
                      className="green-icon-text coupon-info"
                      data-testid="coupon-success-with-date"
                    >
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
                    <div
                      className="green-icon-text coupon-info"
                      data-testid="coupon-success"
                    >
                      <img src={infoLogo} alt="" />

                      <Localized id={infoBoxMessage.message}>
                        {infoBoxMessage.message}
                      </Localized>
                    </div>
                  ))}
              </div>
            </>
          )}
        </>
      )}

      {showExpandButton && (
        <div data-testid="footer-accordion-button">
          {detailsHidden ? (
            <div
              aria-expanded={!detailsHidden}
              className="accordion-btn"
              data-testid="button"
              onClick={() => setDetailsState(false)}
              role="button"
            >
              <img src={arrowIcon} alt="" />
              <Localized id="plan-details-show-button">
                <div>Show details</div>
              </Localized>
            </div>
          ) : (
            <div
              aria-expanded={!detailsHidden}
              className="accordion-btn"
              data-testid="button"
              onClick={() => setDetailsState(true)}
              role="button"
            >
              <img src={arrowIcon} className="up-arrow" alt="" />
              <Localized id="plan-details-hide-button">
                <div>Hide details</div>
              </Localized>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlanDetails;
