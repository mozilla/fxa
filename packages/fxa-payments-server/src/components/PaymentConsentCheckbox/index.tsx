import React, { useContext } from 'react';
import { Checkbox } from '../fields';
import { Plan } from '../../store/types';
import {
  getDefaultPaymentConfirmText,
  getLocalizedCurrency,
} from '../../lib/formats';
import { urlsFromProductConfig } from 'fxa-shared/subscriptions/configuration/helpers';
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
  const { navigatorLanguages, config } = useContext(AppContext);

  const { termsOfService, privacyNotice } = urlsFromProductConfig(
    plan,
    navigatorLanguages,
    config.featureFlags.useFirestoreProductConfigs
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
        termsOfServiceLink: <a href={termsOfService}>Terms of Service</a>,
        privacyNoticeLink: <a href={privacyNotice}>Privacy Notice</a>,
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
