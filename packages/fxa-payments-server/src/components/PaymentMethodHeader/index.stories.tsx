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
  active: true,
  plan_metadata: null,
  product_metadata: null,
};

export default {
  title: 'Components/PaymentMethodHeader',
  component: PaymentMethodHeader,
} as Meta;

const storyWithProps = (plan: Plan, type?: PaymentMethodHeaderType) => {
  const story = () => (
    <MockApp>
      <PaymentMethodHeader {...{ plan, onClick: () => {}, type }} />
    </MockApp>
  );

  return story;
};

export const Default = storyWithProps(selectedPlan);

export const WithPrefix = storyWithProps(
  selectedPlan,
  PaymentMethodHeaderType.SecondStep
);
