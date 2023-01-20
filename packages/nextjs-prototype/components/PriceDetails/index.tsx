import { useState } from 'react';
import { Localized } from '@fluent/react';
import {
  formatPlanPricing,
  getLocalizedCurrency,
  getLocalizedCurrencyString,
  getLocalizedDate,
} from '../../lib/formats';
import { PlanInterval } from 'fxa-shared/subscriptions/types';
import Image from 'next/image';
import FIREFOX_LOGO from '../../public/images/firefox-logo.svg';
import INFO_ICON from '../../public/images/info.svg';

export type PriceInfo = {
  id: string;
  name: string;
  productName: string;
  listPrice: number;
  taxAmount?: number;
  discountAmount?: number;
  totalPrice: number;
  currency: string;
  interval: PlanInterval;
  intervalCount: number;
  details: string[];
  subtitle: string;
};

export type PlanDetailsAdditionalStyles = {
  webIcon?: string;
  webIconBackground?: string;
};

export type InfoBoxMessage = {
  message: string;
  couponDurationDate?: number;
};

export type PriceDetailsProps = {
  priceInfo: PriceInfo;
  additionalStyles?: PlanDetailsAdditionalStyles;
  showExpandButton?: boolean;
  className?: string;
  infoBox?: InfoBoxMessage;
};

export default function PriceDetails(props: PriceDetailsProps) {
  const { priceInfo, className, additionalStyles, showExpandButton, infoBox } =
    props;
  const {
    productName,
    listPrice,
    taxAmount,
    discountAmount,
    totalPrice,
    interval,
    intervalCount,
    currency,
    details,
    subtitle,
  } = priceInfo;

  const [detailsHidden, setDetailsState] = useState(showExpandButton);

  return (
    <div
      className={`component-card px-4 rounded-t-none tablet:rounded-t-lg ${className}`}
      data-testid="plan-details-component"
    >
      <div className="plan-details-header row-divider-grey-200">
        <div className="plan-details-logo-wrap" style={{}}>
          <Image
            src={additionalStyles?.webIcon || FIREFOX_LOGO}
            alt={productName}
            data-testid="product-logo"
            className="plan-details-icon"
            width={64}
            height={64}
          />
        </div>

        <div className="text-start text-sm">
          <h3 id="plan-details-product" className="plan-details-product">
            {productName}
          </h3>

          <p className="plan-details-description">
            <Localized
              id={`plan-price-interval-${interval}`}
              vars={{
                amount: getLocalizedCurrency(listPrice, currency),
                intervalCount: intervalCount,
              }}
            >
              {formatPlanPricing(listPrice, currency, interval, intervalCount)}
            </Localized>
            &nbsp;&bull;&nbsp;
            <span>{subtitle}</span>
          </p>
        </div>
      </div>

      {!detailsHidden && (
        <>
          <div data-testid="list">
            <Localized id="plan-details-header">
              <h4 className="text-sm text-grey-600 my-4">Product details</h4>
            </Localized>

            <ul className="row-divider-grey-200 text-grey-400 m-0 px-3 text-sm">
              {details.map((detail, idx) => (
                <li className="mb-4 leading-5 marker:text-xs" key={idx}>
                  {detail}
                </li>
              ))}
            </ul>
          </div>
          <>
            <div className="row-divider-grey-200 py-6">
              {!!listPrice && (
                <div className="plan-details-item">
                  <Localized id="plan-details-list-price">
                    <div>List Price</div>
                  </Localized>

                  <Localized
                    id={`list-price`}
                    attrs={{ title: true }}
                    vars={{
                      amount: getLocalizedCurrency(listPrice, currency),
                      intervalCount: intervalCount,
                    }}
                  >
                    <div>{getLocalizedCurrencyString(listPrice, currency)}</div>
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
                      intervalCount,
                    }}
                  >
                    <div data-testid="tax-amount">
                      {getLocalizedCurrencyString(taxAmount, currency)}
                    </div>
                  </Localized>
                </div>
              )}

              {/* {exclusiveTaxRates.length > 1 &&
                  exclusiveTaxRates.map((taxRate, idx) => (
                    <div className="plan-details-item">
                      <div>{taxRate.display_name}</div>

                      <Localized
                        id={`tax`}
                        key={idx}
                        attrs={{ title: true }}
                        vars={{
                          amount: getLocalizedCurrency(
                            taxRate.amount,
                            currency
                          ),
                          intervalCount: intervalCount,
                        }}
                      >
                        <div>
                          {getLocalizedCurrencyString(taxRate.amount, currency)}
                        </div>
                      </Localized>
                    </div>
                  ))} */}

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
                      intervalCount: intervalCount,
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
              {!!totalPrice && (
                <div className="plan-details-item font-semibold">
                  <Localized id="plan-details-total-label">
                    <div className="total-label">Total</div>
                  </Localized>

                  <Localized
                    id={`plan-price-interval-${interval}`}
                    data-testid="plan-price-total"
                    attrs={{ title: true }}
                    vars={{
                      amount: getLocalizedCurrency(totalPrice, currency),
                      intervalCount: intervalCount,
                    }}
                  >
                    <div
                      className="total-price"
                      title={`${totalPrice}`}
                      data-testid="total-price"
                      id="total-price"
                    >
                      {formatPlanPricing(
                        totalPrice,
                        currency,
                        interval,
                        intervalCount
                      )}
                    </div>
                  </Localized>
                </div>
              )}

              {infoBox &&
                (infoBox.couponDurationDate ? (
                  <div
                    className="green-icon-text coupon-info"
                    data-testid="coupon-success-with-date"
                  >
                    <Image src={INFO_ICON} alt="" />

                    <Localized
                      id={infoBox.message}
                      vars={{
                        couponDurationDate: getLocalizedDate(
                          infoBox.couponDurationDate,
                          true
                        ),
                      }}
                    >
                      {infoBox.message}
                    </Localized>
                  </div>
                ) : (
                  <div
                    className="green-icon-text coupon-info"
                    data-testid="coupon-success"
                  >
                    <Image src={INFO_ICON} alt="" />

                    <Localized id={infoBox.message}>
                      {infoBox.message}
                    </Localized>
                  </div>
                ))}
            </div>
          </>
        </>
      )}

      {showExpandButton && (
        <div className="text-center" data-testid="footer">
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
  );
}
