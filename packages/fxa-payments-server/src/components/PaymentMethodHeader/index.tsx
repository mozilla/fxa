import { Localized } from '@fluent/react';
import { Plan } from 'fxa-shared/subscriptions/types';
import React from 'react';
import useValidatorState from '../../lib/validator';
import { Form } from '../fields';
import { PaymentConsentCheckbox } from '../PaymentConsentCheckbox';

export enum PaymentMethodHeaderType {
  NoPrefix,
  SecondStep,
}

const returnPaymentMethodHeader = (type: PaymentMethodHeaderType) => {
  switch (type) {
    case PaymentMethodHeaderType.SecondStep:
      return (
        <Localized id="payment-method-header-second-step">
          <h2 className="mt-10" data-testid="header-prefix">
            2. Choose your payment method
          </h2>
        </Localized>
      );
    case PaymentMethodHeaderType.NoPrefix:
    default:
      return (
        <Localized id="payment-method-header">
          <h2 className="mt-10" data-testid="header">
            Choose your payment method
          </h2>
        </Localized>
      );
  }
};

export type PaymentMethodHeaderProps = {
  plan: Plan;
  onClick: (event: React.MouseEvent<HTMLInputElement>) => void;
  type?: PaymentMethodHeaderType;
};

export const PaymentMethodHeader = ({
  plan,
  onClick,
  type,
}: PaymentMethodHeaderProps) => {
  const checkboxValidator = useValidatorState();
  return (
    <>
      {returnPaymentMethodHeader(type || PaymentMethodHeaderType.NoPrefix)}
      <Localized id="payment-method-required">
        <strong>Required</strong>
      </Localized>
      <Form validator={checkboxValidator}>
        <PaymentConsentCheckbox plan={plan} onClick={onClick} />
      </Form>
    </>
  );
};
