import React from 'react';
import { storiesOf } from '@storybook/react';
import MockApp from '../../../.storybook/components/MockApp';
import { SignInLayout } from '../AppLayout';
import PaymentForm, { PaymentFormProps } from './index';
import { action } from '@storybook/addon-actions';

function init() {
  storiesOf('components/PaymentForm', module)
    .add('default', () =>
      <Subject />
    )
}

type SubjectProps = {
  onPayment?: (tokenResponse: stripe.TokenResponse) => void,
  onPaymentError?: (error: any) => void,
};

const Subject = ({
  onPayment = action('onPayment'),
  onPaymentError = action('onPaymentError'),
}: SubjectProps) => {
  const paymentFormProps: PaymentFormProps = {
    onPayment,
    onPaymentError,
  };
  return (
    <MockPage>
      <PaymentForm {...paymentFormProps} />
    </MockPage>
  );
};

type MockPageProps = {
  children: React.ReactNode,
};

const MockPage = ({ children }: MockPageProps) => {
  return (
    <MockApp>
      <SignInLayout>
        {children}
      </SignInLayout>
    </MockApp>
  );
};

init();