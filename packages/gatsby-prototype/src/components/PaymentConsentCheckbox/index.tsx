import { Localized } from '@fluent/react';
import { urlsFromProductConfig } from 'fxa-shared/subscriptions/configuration/utils';
import React, { useContext } from 'react';

// import AppContext from '../../lib/AppContext';
import { Plan } from '../../lib/types';
import { Checkbox } from '../fields';

export type PaymentConsentCheckboxProps = {
  plan: Plan;
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
};

export const PaymentConsentCheckbox = ({
  plan,
  onClick,
}: PaymentConsentCheckboxProps) => {
  // const { navigatorLanguages, config } = useContext(AppContext);

  // const { termsOfService, privacyNotice } = urlsFromProductConfig(
  //   plan,
  //   navigatorLanguages,
  //   config.featureFlags.useFirestoreProductConfigs
  // );

  return (
    <Localized
      id="payment-confirm-with-legal-links-static"
      elems={
        {
          // termsOfServiceLink: <a href={termsOfService}>Terms of Service</a>,
          // privacyNoticeLink: <a href={privacyNotice}>Privacy Notice</a>,
        }
      }
    >
      <Checkbox name="confirm" data-testid="confirm" onClick={onClick} required>
        I authorize Mozilla, maker of Firefox products, to charge my payment
        method for the amount shown, according to{' '}
        {/* <a href={termsOfService}>Terms of Service</a> and{' '} */}
        {/* <a href={privacyNotice}>Privacy Notice</a>, until I cancel my */}
        subscription.
      </Checkbox>
    </Localized>
  );
};
