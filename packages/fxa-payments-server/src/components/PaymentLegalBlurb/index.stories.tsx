import React from 'react';
import { MockApp } from '../../../.storybook/components/MockApp';
import PaymentLegalBlurb from './index';
import * as PaymentProvider from '../../lib/PaymentProvider';
import { Meta } from '@storybook/react';

export default {
  title: 'components/PaymentLegalBlurb',
  component: PaymentLegalBlurb,
} as Meta;

const storyWithContext = (
  provider?: PaymentProvider.PaymentProvider,
  storyName?: string
) => {
  const story = () => (
    <MockApp>
      <PaymentLegalBlurb {...{ provider }} />
    </MockApp>
  );

  if (storyName) story.storyName = storyName;
  return story;
};

export const Default = storyWithContext(
  PaymentProvider.PaymentProviders.none,
  'default'
);

export const Paypal = storyWithContext(
  PaymentProvider.PaymentProviders.paypal,
  'paypal'
);

export const Stripe = storyWithContext(
  PaymentProvider.PaymentProviders.stripe,
  'stripe'
);
