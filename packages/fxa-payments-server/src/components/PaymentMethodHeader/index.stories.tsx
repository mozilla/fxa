import React from 'react';
import MockApp from '../../../.storybook/components/MockApp';
import { PaymentMethodHeader, PaymentMethodHeaderType } from './index';
import { Plan } from '../../store/types';
import { Meta } from '@storybook/react';

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

export default {
  title: 'Components/PaymentMethodHeader',
  component: PaymentMethodHeader,
} as Meta;

const storyWithContext = (
  plan: Plan,
  storyName?: string,
  type?: PaymentMethodHeaderType
) => {
  const story = () => (
    <MockApp>
      <PaymentMethodHeader {...{ plan, onClick: () => {}, type }} />
    </MockApp>
  );

  if (storyName) story.storyName = storyName;
  return story;
};

export const basic = storyWithContext(selectedPlan, 'default');

export const withPrefix = storyWithContext(
  selectedPlan,
  'with prefix',
  PaymentMethodHeaderType.SecondStep
);
