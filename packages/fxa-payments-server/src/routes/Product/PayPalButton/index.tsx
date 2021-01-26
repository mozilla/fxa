import React from 'react';
import ReactDOM from 'react-dom';

declare var paypal: {
  Buttons: {
    driver: Function;
  };
};

const PaypalButtonBase = paypal.Buttons.driver('react', {
  React,
  ReactDOM,
});

export const PaypalButton = () => {
  return <PaypalButtonBase data-testid="paypal-button" />;
};

export default PaypalButton;
