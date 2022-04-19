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
  customer = CUSTOMER,
  idempotencyKey = '',
  refreshSubmitNonce = () => {},
  selectedPlan = PLAN,
  newPaypalAgreement = false,
  postSubscriptionAttemptPaypalCallback = linkTo('routes/Product', 'success'),
  setSubscriptionError = () => {},
  setTransactionInProgress = () => {},
  ...props
}: PickPartial<
  PaypalButtonProps,
  | 'disabled'
  | 'customer'
  | 'idempotencyKey'
  | 'refreshSubmitNonce'
  | 'selectedPlan'
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
        customer,
        idempotencyKey,
        refreshSubmitNonce,
        selectedPlan,
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
