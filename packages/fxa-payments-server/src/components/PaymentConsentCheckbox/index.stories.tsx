import React from 'react';
import { storiesOf } from '@storybook/react';
import { PaymentConsentCheckbox } from './index';
import { Form } from '../fields';
import useValidatorState from '../../lib/validator';
import { MockApp } from '../../../.storybook/components/MockApp';
import { SELECTED_PLAN } from '../../lib/mock-data';

const WrapCheckbox = () => {
  const validator = useValidatorState();
  return (
    <Form validator={validator}>
      <PaymentConsentCheckbox plan={SELECTED_PLAN} />
    </Form>
  );
};

storiesOf('components/PaymentConsentCheckbox', module).add('default', () => (
  <div style={{ display: 'flex' }}>
    <MockApp languages={['auto']}>
      <div className="product-payment">
        <WrapCheckbox />
      </div>
    </MockApp>
  </div>
));
