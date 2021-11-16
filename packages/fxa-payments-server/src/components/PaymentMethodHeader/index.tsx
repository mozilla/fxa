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
  return (
    <>
      <Localized id="payment-method-header" vars={{ prefix }}>
        <h2 style={{ marginTop: '40px' }} data-testid="header">
          Choose your payment method
        </h2>
      </Localized>
      <Localized id="payment-method-required">
        <strong>Required</strong>
      </Localized>
      <Form validator={checkboxValidator}>
        <PaymentConsentCheckbox plan={plan} onClick={onClick} />
      </Form>
    </>
  );
};
