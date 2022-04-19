import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { PaypalButton, PaypalButtonProps } from './index';

import { PickPartial } from '../../lib/types';
import { CUSTOMER, PLAN } from '../../lib/mock-data';

const Subject = ({
  disabled = false,
  customer = CUSTOMER,
  idempotencyKey = '',
  refreshSubmitNonce = () => {},
  selectedPlan = PLAN,
  newPaypalAgreement = false,
  postSubscriptionAttemptPaypalCallback = () => {},
  setSubscriptionError = () => {},
  setTransactionInProgress = () => {},
  ...props
}: PickPartial<
  PaypalButtonProps,
  | 'disabled'
  | 'customer'
  | 'idempotencyKey'
  | 'refreshSubmitNonce'
  | 'selectedPlan'
  | 'newPaypalAgreement'
  | 'postSubscriptionAttemptPaypalCallback'
  | 'setSubscriptionError'
  | 'setTransactionInProgress'
>) => {
  return (
    <PaypalButton
      {...{
        disabled,
        customer,
        idempotencyKey,
        refreshSubmitNonce,
        selectedPlan,
        newPaypalAgreement,
        postSubscriptionAttemptPaypalCallback,
        setSubscriptionError,
        setTransactionInProgress,
        ...props,
      }}
    />
  );
};

describe('PaypalButton', () => {
  it("Doesn't render the PayPal button if the PayPal script fails to load", async () => {
    // The script is loaded in this button's consumer (e.g. SubscriptionCreate), so we
    // can guarantee that it won't be loaded for the button in isolation
    render(<Subject />);
    expect(screen.queryByTestId('paypal-button')).not.toBeInTheDocument();
  });
});
