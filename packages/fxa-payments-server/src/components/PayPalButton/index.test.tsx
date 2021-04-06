import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { PaypalButton, PaypalButtonProps } from './index';

import { PickPartial } from '../../lib/types';
import { CUSTOMER, PLAN } from '../../lib/mock-data';

const Subject = ({
  currencyCode = 'USD',
  customer = CUSTOMER,
  idempotencyKey = '',
  priceId = PLAN.plan_id,
  newPaypalAgreement = false,
  refreshSubscriptions = () => {},
  setPaymentError = () => {},
  setTransactionInProgress = () => {},
  ...props
}: PickPartial<
  PaypalButtonProps,
  | 'currencyCode'
  | 'customer'
  | 'idempotencyKey'
  | 'priceId'
  | 'newPaypalAgreement'
  | 'refreshSubscriptions'
  | 'setPaymentError'
  | 'setTransactionInProgress'
>) => {
  return (
    <PaypalButton
      {...{
        currencyCode,
        customer,
        idempotencyKey,
        priceId,
        newPaypalAgreement,
        refreshSubscriptions,
        setPaymentError,
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
