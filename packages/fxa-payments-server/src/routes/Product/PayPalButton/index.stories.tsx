import React from 'react';
import { storiesOf } from '@storybook/react';
import { PaypalButton } from './index';

storiesOf('routes/Product/PaypalButton', module).add('default', () => (
  <PaypalButton />
));
