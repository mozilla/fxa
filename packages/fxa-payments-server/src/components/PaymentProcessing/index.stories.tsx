import React from 'react';
import { PaymentProcessing } from '.';
import { Meta } from '@storybook/react';

export default {
  title: 'Components/PaymentProcessing',
  component: PaymentProcessing,
} as Meta;

const storyWithContext = (storyName?: string) => {
  const story = () => <PaymentProcessing provider="paypal" />;

  if (storyName) story.storyName = storyName;
  return story;
};

export const Default = storyWithContext('default');
