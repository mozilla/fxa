import { Localized } from '@fluent/react';
import { Plan } from 'fxa-shared/subscriptions/types';
import React from 'react';
import useValidatorState from '../../lib/validator';
import { Form } from '../fields';
import { PaymentConsentCheckbox } from '../PaymentConsentCheckbox';

export type PaymentMethodHeaderProps = {
  plan: Plan;
  onClick: (event: React.MouseEvent<HTMLInputElement>) => void;
  prefix?: string;
};

export const PaymentMethodHeader = ({
  plan,
  onClick,
  prefix = '',
}: PaymentMethodHeaderProps) => {
  const checkboxValidator = useValidatorState();
  const headerMarginTop = '40px';
  return (
    <>
      {prefix ? (
        <Localized id="payment-method-header-prefix" vars={{ prefix }}>
          <h2
            style={{ marginTop: headerMarginTop }}
            data-testid="header-prefix"
          >
            Choose your payment method
          </h2>
        </Localized>
      ) : (
        <Localized id="payment-method-header">
          <h2 style={{ marginTop: headerMarginTop }} data-testid="header">
            Choose your payment method
          </h2>
        </Localized>
      )}
      <Localized id="payment-method-required">
        <strong>Required</strong>
      </Localized>
      <Form validator={checkboxValidator}>
        <PaymentConsentCheckbox plan={plan} onClick={onClick} />
      </Form>
    </>
  );
};
