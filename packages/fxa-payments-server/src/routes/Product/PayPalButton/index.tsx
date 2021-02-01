import React from 'react';
import ReactDOM from 'react-dom';

import { useCallback } from 'react';

declare var paypal: {
  Buttons: {
    driver: Function;
  };
};

interface PayPalButtonProps {
  onCreateOrder: Function;
  _onApprove: Function;
}

const PaypalButtonBase = paypal.Buttons.driver('react', {
  React,
  ReactDOM,
});

export const PaypalButton = ({
  // TODO: Make these names more consistent and avoid shadowing e.g. onApprove; is there a convention?
  onCreateOrder,
  _onApprove,
}: PayPalButtonProps) => {
  const createOrder = useCallback(async (data: any, actions: any) => {
    const token = await onCreateOrder();
    return token;
  }, []);
  const onApprove = useCallback(async (data: any, actions: any) => {
    // 1. Get the checkout token passed in (same as the one obtained in createOrder)
    const token = data.orderID;
    // 2. POST to /oauth/subscriptions/active/new-paypal
    await _onApprove(token);
    // 3. While waiting for a success response, show a loading gif over the Paypal button
    // TODO
    // 4. Perhaps on an `onSuccess` or `onError` callback, redirect to existing success/failure pages
    // Updating these pages is handled in a separate issue
    // TODO
  }, []);

  return (
    <PaypalButtonBase
      data-testid="paypal-button"
      createOrder={createOrder}
      onApprove={onApprove}
    />
  );
};

export default PaypalButton;
