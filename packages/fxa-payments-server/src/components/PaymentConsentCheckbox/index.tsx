import React, { useContext } from 'react';
import { Checkbox } from '../fields';
import { Plan } from '../../store/types';
import {
  getDefaultPaymentConfirmText,
  getLocalizedCurrency,
} from '../../lib/formats';
import { productDetailsFromPlan } from 'fxa-shared/subscriptions/metadata';
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
        {getDefaultPaymentConfirmText(
          plan.amount,
          plan.currency,
          plan.interval,
          plan.interval_count
        )}
      </Checkbox>
    </Localized>
  );
};
