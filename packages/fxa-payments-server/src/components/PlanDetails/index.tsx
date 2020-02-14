import React, { useState } from 'react';
import { Localized } from 'fluent-react';
import { formatCurrencyInCents } from '../../lib/formats';

import './index.scss';
import { Plan } from '../../store/types';

type PlanDetailsProps = {
  plan: Plan;
  showExpandButton: boolean;
  className?: string;
};

export const PlanDetails = ({
  plan,
  showExpandButton,
  className = 'default',
}: PlanDetailsProps) => {
  const initialDetailsHiddenState = showExpandButton ? true : false;
  const [detailsHidden, setDetailsState] = useState(initialDetailsHiddenState);
  const {
    product_name,
    amount,
    interval,
  } = plan;

  const up = <span className="up-chevron">&rsaquo;</span>;
  const down = <span className="down-chevron">&rsaquo;</span>;

  return (
    <section className={`container card plan-details-component ${className}`}>
      <div className="plan-details-header">
        <div className="plan-details-header-wrap">
          < img
            src={'./images/fpn.svg'}
            alt={product_name}
          />
          <div className="plan-details-heading-wrap">
            <h3 className="plan-details-product">{product_name}</h3>
            <p className="plan-details-description">Full-device VPN</p>
          </div>
        </div>
        <p>
          ${formatCurrencyInCents(amount)}/{interval}
        </p>
      </div>
      {!detailsHidden ? (
        <div className="plan-details-list">
          <Localized id="plan-details-header">
            <h4>Product details</h4>
          </Localized>
          <ul>
            <Localized id="fpn-details-1">
              <li></li>
            </Localized>
            <Localized id="fpn-details-2">
              <li></li>
            </Localized>
            <Localized id="fpn-details-3">
              <li></li>
            </Localized>
            <Localized id="fpn-details-4">
              <li></li>
            </Localized>
          </ul>
        </div>
      ) : null}
      {showExpandButton ? (
        <section className="footer">
          {detailsHidden ? (
            <Localized id="plan-details-show-button" span={down}>
              <button
                className="btn down-arrow"
                aria-expanded={!detailsHidden}
                onClick={() => setDetailsState(false)}
              >
                Show details
              </button>
            </Localized>
          ) : (
            <Localized id="plan-details-hide-button" span={up}>
              <button className="btn up-arrow"
                 aria-expanded={!detailsHidden}
                 onClick={() => setDetailsState(true)}>
                Hide details
              </button>
            </Localized>
          )}
        </section>
      ) : null}
    </section>
  );
};

export default PlanDetails;
