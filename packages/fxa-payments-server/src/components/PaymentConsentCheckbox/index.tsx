import React, { useContext } from 'react';
import { Checkbox } from '../fields';
import { Plan } from '../../store/types';
import { productDetailsFromPlan } from 'fxa-shared/subscriptions/metadata';
import { formatPlanPricing, getLocalizedCurrency } from '../../lib/formats';
import AppContext from '../../lib/AppContext';
import { Localized } from '@fluent/react';

export type PaymentConsentCheckboxProps = {
  plan: Plan;
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
};

export const PaymentConsentCheckbox = ({
  plan,
  onClick,
}: PaymentConsentCheckboxProps) => {
  const { navigatorLanguages } = useContext(AppContext);

  const { termsOfServiceURL, privacyNoticeURL } = productDetailsFromPlan(
    plan,
    navigatorLanguages
  );

  const planPricing = formatPlanPricing(
    plan.amount,
    plan.currency,
    plan.interval,
    plan.interval_count
  );

  return (
    <Localized
      id={`payment-confirm-with-legal-links-${plan.interval}`}
      vars={{
        intervalCount: plan.interval_count,
        amount: getLocalizedCurrency(plan.amount, plan.currency),
      }}
      elems={{
        strong: <strong></strong>,
        termsOfServiceLink: <a href={termsOfServiceURL}>Terms of Service</a>,
        privacyNoticeLink: <a href={privacyNoticeURL}>Privacy Notice</a>,
      }}
    >
      <Checkbox name="confirm" data-testid="confirm" onClick={onClick} required>
        I authorize Mozilla, maker of Firefox products, to charge my payment
        method <strong>{planPricing}</strong>, according to{' '}
        <a href={termsOfServiceURL}>Terms of Service</a> and{' '}
        <a href={privacyNoticeURL}>Privacy Notice</a>, until I cancel my
        subscription.
      </Checkbox>
    </Localized>
  );
};
