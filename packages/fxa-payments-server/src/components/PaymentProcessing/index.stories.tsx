import React from 'react';
import { storiesOf } from '@storybook/react';
import { PaymentProcessing } from './index';

storiesOf('components/PaymentProcessing', module).add('default', () => (
  <PaymentProcessing provider="paypal" />
));
