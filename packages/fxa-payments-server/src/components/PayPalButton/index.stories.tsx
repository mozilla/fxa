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
  disabled = false,
  apiClientOverrides = defaultApiClientOverrides,
  currencyCode = 'USD',
  customer = CUSTOMER,
  idempotencyKey = '',
  refreshSubmitNonce = () => {},
  priceId = PLAN.plan_id,
  newPaypalAgreement = false,
  postSubscriptionAttemptPaypalCallback = linkTo('routes/Product', 'success'),
  setSubscriptionError = () => {},
  setTransactionInProgress = () => {},
  ...props
}: PickPartial<
  PaypalButtonProps,
  | 'disabled'
  | 'currencyCode'
  | 'customer'
  | 'idempotencyKey'
  | 'refreshSubmitNonce'
  | 'priceId'
  | 'newPaypalAgreement'
  | 'postSubscriptionAttemptPaypalCallback'
  | 'setSubscriptionError'
  | 'setTransactionInProgress'
>) => {
  return (
    <PaypalButton
      {...{
        disabled,
        apiClientOverrides,
        currencyCode,
        customer,
        idempotencyKey,
        refreshSubmitNonce,
        priceId,
        newPaypalAgreement,
        postSubscriptionAttemptPaypalCallback,
        setSubscriptionError,
        setTransactionInProgress,
        ...props,
      }}
    />
  );
};

storiesOf('routes/Product/PaypalButton', module)
  .add('default', () => <Subject />)
  .add('disabled', () => <Subject disabled={true} />);
