import React from 'react';
import { PlanDetailsProps } from './index';
import { formatCurrencyInCents } from '../../../lib/formats';

export const DefaultDetails = ({
  plan: { amount, interval, plan_name },
}: PlanDetailsProps) => {
  return (
    <div className="plan-details" data-testid="plan-123donepro">
      <h2>Let's set up your subscription</h2>
      <p>
        {plan_name} for ${formatCurrencyInCents(amount)} per {interval}
      </p>
    </div>
  );
};

export default DefaultDetails;
