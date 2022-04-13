import React from 'react';
import { storiesOf } from '@storybook/react';
import { MockApp } from '../../../.storybook/components/MockApp';
import PaymentLegalBlub from './index';
import * as PaymentProvider from '../../lib/PaymentProvider';

storiesOf('components/PaymentLegalBlurb', module)
  .add('default', () => (
    <MockApp>
      <PaymentLegalBlub {...{ provider: undefined }}></PaymentLegalBlub>
    </MockApp>
  ))
  .add('paypal', () => (
    <MockApp>
      <PaymentLegalBlub
        {...{ provider: PaymentProvider.PaymentProviders.paypal }}
      ></PaymentLegalBlub>
    </MockApp>
  ))
  .add('stripe', () => (
    <MockApp>
      <PaymentLegalBlub
        {...{ provider: PaymentProvider.PaymentProviders.stripe }}
      ></PaymentLegalBlub>
    </MockApp>
  ));
