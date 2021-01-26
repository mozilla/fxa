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
}

const PaypalButtonBase = paypal.Buttons.driver('react', {
  React,
  ReactDOM,
});

export const PaypalButton = ({ onCreateOrder }: PayPalButtonProps) => {
  const createOrder = useCallback(async (data: any, actions: any) => {
    const token = await onCreateOrder();
    return token;
  }, []);
  const onApprove = useCallback((data: any, actions: any) => {
    console.log('CANARY', 'onApprove', data, actions);
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
