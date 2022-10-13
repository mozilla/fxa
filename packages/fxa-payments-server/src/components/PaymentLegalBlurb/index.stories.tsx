import React from 'react';
import { MockApp } from '../../../.storybook/components/MockApp';
import PaymentLegalBlurb from './index';
import * as PaymentProvider from '../../lib/PaymentProvider';
import { Meta } from '@storybook/react';

export default {
  title: 'components/PaymentLegalBlurb',
  component: PaymentLegalBlurb,
} as Meta;

const storyWithProps = (provider?: PaymentProvider.PaymentProvider) => {
  const story = () => (
    <MockApp>
      <PaymentLegalBlurb {...{ provider }} />
    </MockApp>
  );

  return story;
};

export const Default = storyWithProps(PaymentProvider.PaymentProviders.none);
export const Paypal = storyWithProps(PaymentProvider.PaymentProviders.paypal);
export const Stripe = storyWithProps(PaymentProvider.PaymentProviders.stripe);
