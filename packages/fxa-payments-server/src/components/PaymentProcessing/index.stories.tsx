import React from 'react';
import { PaymentProcessing } from '.';
import { Meta } from '@storybook/react';

export default {
  title: 'Components/PaymentProcessing',
  component: PaymentProcessing,
} as Meta;

export const Default = () => {
  return <PaymentProcessing provider="paypal" />;
};
