import React from 'react';
import { storiesOf } from '@storybook/react';
import { PaymentErrorView } from './index';
import { SELECTED_PLAN } from '../../lib/mock-data';

storiesOf('components/PaymentError', module).add('default', () => (
  <PaymentErrorView
    error={{ code: 'general-paypal-error' }}
    onRetry={() => {}}
    plan={SELECTED_PLAN}
  />
));
