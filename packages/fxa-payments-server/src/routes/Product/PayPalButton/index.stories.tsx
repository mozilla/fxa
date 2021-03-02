import React from 'react';
import { PaypalButton, PaypalButtonProps } from './index';

import { storiesOf } from '@storybook/react';
import { linkTo } from '@storybook/addon-links';
import { CUSTOMER, PLAN } from '../../../lib/mock-data';
import { PickPartial } from '../../../lib/types';

const defaultApiClientOverrides = {
  apiCreateCustomer: async () => CUSTOMER,
};

const Subject = ({
  apiClientOverrides = defaultApiClientOverrides,
  currencyCode = 'USD',
  customer = CUSTOMER,
  idempotencyKey = '',
  priceId = PLAN.plan_id,
  refreshSubscriptions = linkTo('routes/Product', 'success'),
  setPaymentError = () => {},
  setOnClick = () => {},
  ...props
}: PickPartial<
  PaypalButtonProps,
  | 'currencyCode'
  | 'customer'
  | 'idempotencyKey'
  | 'priceId'
  | 'refreshSubscriptions'
  | 'setPaymentError'
  | 'setOnClick'
>) => {
  return (
    <PaypalButton
      {...{
        apiClientOverrides,
        currencyCode,
        customer,
        idempotencyKey,
        priceId,
        refreshSubscriptions,
        setPaymentError,
        setOnClick,
        ...props,
      }}
    />
  );
};

storiesOf('routes/Product/PaypalButton', module).add('default', () => (
  <Subject />
));
