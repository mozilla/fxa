import React from 'react';
import { Localized } from 'fluent-react';
import { PlanDetailsProps } from './index';
import { formatCurrencyInCents } from '../../../lib/formats';

function createDefaultPlanDetails(
  productName: string,
  amount: number,
  interval: string,
  intervalCount: number
) {
  const baseString = `${productName} billed ${formatCurrencyInCents(amount)}`;

  switch (interval) {
    case 'day':
      if (intervalCount === 1) return `${baseString} daily`;
      return `${baseString} every ${intervalCount} days`;
    case 'week':
      if (intervalCount === 1) return `${baseString} weekly`;
      return `${baseString} every ${intervalCount} weeks`;
    case 'month':
      if (intervalCount === 1) return `${baseString} monthly`;
      return `${baseString} every ${intervalCount} months`;
    case 'year':
      if (intervalCount === 1) return `${baseString} yearly`;
      return `${baseString} every ${intervalCount} years`;
  }
}

export const DefaultDetails = ({
  plan: { amount, interval, interval_count, product_name },
}: PlanDetailsProps) => {
  const planDetailsId = `${interval}-based-plan-details-amount`;
  const defaultString = createDefaultPlanDetails(
    product_name,
    amount,
    interval,
    interval_count
  );
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
        <p>{defaultString}</p>
      </Localized>
    </div>
  );
};

export default DefaultDetails;
