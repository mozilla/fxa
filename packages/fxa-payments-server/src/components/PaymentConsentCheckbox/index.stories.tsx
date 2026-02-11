import React from 'react';
import { PaymentConsentCheckbox } from './index';
import { Form } from '../fields';
import useValidatorState from '../../lib/validator';
import { MockApp } from '../../../.storybook/components/MockApp';
import { SELECTED_PLAN } from '../../lib/mock-data';
import { Meta } from '@storybook/react';

export default {
  title: 'components/PaymentConsentCheckbox',
  component: PaymentConsentCheckbox,
} as Meta;

const WrapCheckbox = () => {
  const validator = useValidatorState();
  return (
    <Form validator={validator}>
      <PaymentConsentCheckbox plan={SELECTED_PLAN} />
    </Form>
  );
};

const storyWithContext = (
  languages?: readonly string[],
  storyName?: string
) => {
  const story = () => (
    <div className="flex">
      <MockApp languages={languages}>
        <div className="product-payment">
          <WrapCheckbox />
        </div>
      </MockApp>
    </div>
  );

  if (storyName) story.storyName = storyName;
  return story;
};

export const Default = storyWithContext(['auto'], 'default');
