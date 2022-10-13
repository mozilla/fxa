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

export const Default = () => {
  const validator = useValidatorState();

  return (
    <div className="flex">
      <MockApp languages={['auto']}>
        <div className="product-payment">
          <Form validator={validator}>
            <PaymentConsentCheckbox plan={SELECTED_PLAN} />
          </Form>
        </div>
      </MockApp>
    </div>
  );
};
