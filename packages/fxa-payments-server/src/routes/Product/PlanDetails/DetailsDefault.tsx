import React from 'react';
import { PlanDetailsProps } from './index';
import { formatCurrencyInCents } from '../../../lib/formats';

export const DefaultDetails = ({
  plan: {
    currency,
    amount,
    interval,
    plan_name,
  }
}: PlanDetailsProps) => {
  return (
    <div className="plan-details">
      <h2>Let's set up your subscription</h2>
      <p>For {currency} ${formatCurrencyInCents(amount)} per {interval}, your {plan_name} includes:</p>
      <ul>
        <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit</li>
        <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit</li>
        <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit</li>
      </ul>
    </div>
  );
};

export default DefaultDetails;
