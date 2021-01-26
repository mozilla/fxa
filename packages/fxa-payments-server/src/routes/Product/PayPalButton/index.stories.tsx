import React from 'react';
import { storiesOf } from '@storybook/react';
import { PaypalButton, PaypalButtonProps } from './index';

import { PickPartial } from '../../../lib/types';

const Subject = ({
  customer = null,
  setPaymentError = () => {},
  idempotencyKey = '',
  ...props
}: PickPartial<
  PaypalButtonProps,
  | 'apiClientOverrides'
  | 'customer'
  | 'setPaymentError'
  | 'idempotencyKey'
  | 'ButtonBase'
>) => {
  return (
    <PaypalButton
      {...{
        customer,
        setPaymentError,
        idempotencyKey,
        ...props,
      }}
    />
  );
};

storiesOf('routes/Product/PaypalButton', module).add('default', () => (
  <Subject></Subject>
));
