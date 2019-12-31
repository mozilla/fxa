import React from 'react';
import { Localized } from 'fluent-react';
import { PlanDetailsProps } from './index';
import { formatCurrencyInCents } from '../../../lib/formats';

export const DefaultDetails = ({
  plan: { amount, interval, product_name },
}: PlanDetailsProps) => {
  return (
    <div className="plan-details" data-testid="plan-123donepro">
      <Localized id="product-plan-details-heading">
        <h2>Let's set up your subscription</h2>
      </Localized>
      <Localized
        id="product-plan-details-amount"
        $productName={product_name}
        $amount={formatCurrencyInCents(amount)}
        $interval={interval}
      >
        <p>
          {product_name} for ${formatCurrencyInCents(amount)} per {interval}
        </p>
      </Localized>
    </div>
  );
};

export default DefaultDetails;
