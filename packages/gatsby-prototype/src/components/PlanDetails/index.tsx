import React, { useState } from 'react';
import { Localized } from '@fluent/react';

import { getLocalizedDate } from '../../lib/formats';
import { Coupon, InvoicePreview, Plan } from '../../lib/types';
import { LabelItem } from '../../lib/utils';

import PlanDetailsHeader from '../PlanDetailsHeader';
import infoLogo from '../../images/Information.svg';

export type PlanDetailsProps = {
  selectedPlan: Plan;
  isMobile?: boolean;
  showExpandButton?: boolean;
  invoicePreview?: InvoicePreview;
  coupon?: Coupon;
};

const PlanDetails = ({
  selectedPlan,
  isMobile,
  showExpandButton,
  invoicePreview,
  coupon,
}: PlanDetailsProps) => {
  const { details, currency, interval_count } = selectedPlan;
  const [detailsHidden, setDetailsState] = useState(showExpandButton);
  const role = isMobile ? undefined : 'complementary';

  let discountAmount = coupon?.discountAmount;
  let subtotal = invoicePreview?.subtotal;
  let total = invoicePreview?.total;
  // let infoBoxMessage = null;

  return (
    <div
      className="component-card px-4 rounded-t-none tablet:rounded-t-lg"
      {...{ role }}
      data-testid="plan-details-component"
    >
      <PlanDetailsHeader selectedPlan={selectedPlan} />

      {!detailsHidden && (
        <>
          <div data-testid="list">
            <Localized id="plan-details-header">
              <div className="font-semibold text-grey-600 my-4">
                Product details
              </div>
            </Localized>

            <ul className="row-divider-grey-200 text-grey-400 m-0 px-3">
              {details.map((detail: string, idx: number) => (
                <li
                  key={`detail-${idx}`}
                  className="mb-4 leading-5 marker:text-xs"
                >
                  {detail}
                </li>
              ))}
            </ul>
          </div>

          <div className="row-divider-grey-200 py-6">
            {subtotal && (
              <LabelItem
                label="List Price"
                amount={subtotal}
                currency={currency}
                intervalCount={interval_count}
              />
            )}

            {/* {exclusiveTaxRates?.length === 1 && (
              <LabelItem
                label="Taxes and Fees"
                amount={exclusiveTaxRates[0].amount}
                currency={currency}
              />
            )}

            {exclusiveTaxRates?.length > 1 &&
              exclusiveTaxRates.map((taxRate, idx) => (
                <LabelItem
                  label={taxRate.display_name}
                  amount={taxRate.amount}
                  currency={currency}
                  idNum={idx}
                />
              ))} */}

            {discountAmount && (
              <LabelItem
                label="Promo Code"
                amount={discountAmount}
                currency={currency}
                intervalCount={interval_count}
              />
            )}
          </div>

          <div className="font-semibold pt-4 pb-6">
            {total && (
              <LabelItem
                label="Total"
                amount={total}
                currency={currency}
                intervalCount={interval_count}
              />
            )}

            {/* {infoBoxMessage &&
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
              ))} */}
          </div>
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
};

export default PlanDetails;
