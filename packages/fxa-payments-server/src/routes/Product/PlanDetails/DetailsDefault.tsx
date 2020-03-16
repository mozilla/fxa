import React from 'react';
import { Localized } from 'fluent-react';
import { PlanDetailsProps } from './index';
import { formatCurrencyInCents } from '../../../lib/formats';

export const DefaultDetails = ({
  plan: { amount, interval, interval_count, product_name },
}: PlanDetailsProps) => {
  const planDetailsId = `${interval}-based-plan-details-amount`;
  return (
    <div className="plan-details" data-testid="plan-default">
      <Localized id="product-plan-details-heading">
        <h2>Let's set up your subscription</h2>
      </Localized>
      <Localized
        id={planDetailsId}
        $productName={product_name}
        $amount={formatCurrencyInCents(amount)}
        $intervalCount={interval_count}
      >
        <p>
          {product_name} billed ${amount} every {formatCurrencyInCents(amount)}{' '}
          {interval}s.
        </p>
      </Localized>
    </div>
  );
};

export default DefaultDetails;
