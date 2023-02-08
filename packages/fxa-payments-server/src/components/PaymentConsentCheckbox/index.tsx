import { Localized } from '@fluent/react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { urlsFromProductConfig } from 'fxa-shared/subscriptions/configuration/utils';
import React, { useContext } from 'react';

import AppContext from '../../lib/AppContext';
import { Plan } from '../../store/types';
import { Checkbox } from '../fields';

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
      id="payment-confirm-with-legal-links-static"
      elems={{
        termsOfServiceLink: (
          <LinkExternal href={termsOfService}>Terms of Service</LinkExternal>
        ),
        privacyNoticeLink: (
          <LinkExternal href={privacyNotice}>Privacy Notice</LinkExternal>
        ),
      }}
    >
      <Checkbox name="confirm" data-testid="confirm" onClick={onClick} required>
        I authorize Mozilla, maker of Firefox products, to charge my payment
        method for the amount shown, according to{' '}
        <LinkExternal href={termsOfService}>Terms of Service</LinkExternal> and{' '}
        <LinkExternal href={privacyNotice}>Privacy Notice</LinkExternal>, until
        I cancel my subscription.
      </Checkbox>
    </Localized>
  );
};
