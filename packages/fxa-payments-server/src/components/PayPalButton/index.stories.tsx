import React from 'react';
import { PaypalButton, PaypalButtonProps } from './index';

import { storiesOf } from '@storybook/react';
import { linkTo } from '@storybook/addon-links';
import { CUSTOMER, PLAN } from '../../lib/mock-data';
import { PickPartial } from '../../lib/types';

const defaultApiClientOverrides = {
  apiCreateCustomer: async () => CUSTOMER,
};

const Subject = ({
  apiClientOverrides = defaultApiClientOverrides,
  currencyCode = 'USD',
  customer = CUSTOMER,
  idempotencyKey = '',
  priceId = PLAN.plan_id,
  newPaypalAgreement = false,
  refreshSubscriptions = linkTo('routes/Product', 'success'),
  setPaymentError = () => {},
  setTransactionInProgress = () => {},
  ...props
}: PickPartial<
  PaypalButtonProps,
  | 'currencyCode'
  | 'customer'
  | 'idempotencyKey'
  | 'priceId'
  | 'newPaypalAgreement'
  | 'refreshSubscriptions'
  | 'setPaymentError'
  | 'setTransactionInProgress'
>) => {
  return (
    <PaypalButton
      {...{
        apiClientOverrides,
        currencyCode,
        customer,
        idempotencyKey,
        priceId,
        newPaypalAgreement,
        refreshSubscriptions,
        setPaymentError,
        setTransactionInProgress,
        ...props,
      }}
    />
  );
};

storiesOf('routes/Product/PaypalButton', module).add('default', () => (
  <Subject />
));
