import React from 'react';
import { storiesOf } from '@storybook/react';
import MockApp from '../../../.storybook/components/MockApp';
import { PaymentMethodHeader, PaymentMethodHeaderType } from './index';
import { Plan } from '../../store/types';

const selectedPlan: Plan = {
  plan_id: 'planId',
  product_id: 'fpnID',
  product_name: 'Firefox Private Network Pro',
  currency: 'usd',
  amount: 935,
  interval: 'month' as const,
  interval_count: 1,
  plan_metadata: null,
  product_metadata: null,
};

storiesOf('components/PaymentMethodHeader', module)
  .add('default', () => (
    <MockApp>
      <PaymentMethodHeader {...{ plan: selectedPlan, onClick: () => {} }} />
    </MockApp>
  ))
  .add('With prefix', () => (
    <MockApp>
      <PaymentMethodHeader
        {...{
          plan: selectedPlan,
          onClick: () => {},
          type: PaymentMethodHeaderType.SecondStep,
        }}
      />
    </MockApp>
  ));
