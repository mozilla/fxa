import { Localized } from '@fluent/react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { FirstInvoicePreview } from 'fxa-shared/dto/auth/payments/invoice';
import { urlsFromProductConfig } from 'fxa-shared/subscriptions/configuration/utils';
import React, { useContext } from 'react';

import AppContext from '../../lib/AppContext';
import { formatPlanPricing } from '../../lib/formats';
import { Plan } from '../../store/types';
import { Checkbox } from '../fields';

export type PaymentConsentCheckboxProps = {
  plan: Plan;
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
  invoice?: FirstInvoicePreview;
};

export const PaymentConsentCheckbox = ({
  plan,
  onClick,
  invoice,
}: PaymentConsentCheckboxProps) => {
  const { navigatorLanguages, config } = useContext(AppContext);

  const { termsOfService, privacyNotice } = urlsFromProductConfig(
    plan,
    navigatorLanguages,
    config.featureFlags.useFirestoreProductConfigs
  );

  const { amount, currency, interval, interval_count } = plan;
  const displayedPrice = invoice ? invoice.total : amount;
  const price = formatPlanPricing(
    displayedPrice as unknown as number,
    currency,
    interval,
    interval_count
  );

  return (
    <Localized
      id="payment-confirm-with-legal-links"
      vars={{ price: price, productName: plan.product_name }}
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
        method {price} for {plan.product_name}, according to{' '}
        <LinkExternal href={termsOfService}>Terms of Service</LinkExternal> and{' '}
        <LinkExternal href={privacyNotice}>Privacy Notice</LinkExternal>, until
        I cancel my subscription.
      </Checkbox>
    </Localized>
  );
};
