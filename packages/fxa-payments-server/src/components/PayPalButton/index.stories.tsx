import React from 'react';
import { PaypalButton, PaypalButtonProps } from './index';

import { linkTo } from '@storybook/addon-links';
import { CUSTOMER, PLAN } from '../../lib/mock-data';
import { PickPartial } from '../../lib/types';
import { Meta } from '@storybook/react';

export default {
  title: 'Routes/Product/PaypalButton',
  component: PaypalButton,
} as Meta;

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

const storyWithContext = (
  storyName?: string,
  disabled?: boolean,
) => {
  const story = () => (
    <Subject disabled={disabled} />
  );
  if (storyName) story.storyName = storyName;
  return story;
}

export const Default = storyWithContext(
  'default'
)

export const Disabled = storyWithContext(
  'disabled',
  true
)
