import React from 'react';
import { storiesOf } from '@storybook/react';
import { PaymentErrorView } from './index';

storiesOf('components/PaymentError', module).add('default', () => (
  <PaymentErrorView
    error={{ code: 'general-paypal-error' }}
    onRetry={() => {}}
  />
));
