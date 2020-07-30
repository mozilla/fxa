import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import MockApp from '../../../.storybook/components/MockApp';
import { SignInLayout } from '../AppLayout';
import PaymentForm, { PaymentFormProps } from './index';
import {
  State as ValidatorState,
  MiddlewareReducer as ValidatorMiddlewareReducer,
} from '../../lib/validator';
import { Plan } from '../../store/types';
import { useNonce } from '../../lib/hooks';

function init() {
  storiesOf('components/PaymentForm', module)
    .add('default', () => <Subject />)
    .add('without plan', () => <Subject noPlan />)
    .add('without confirmation', () => <Subject confirm={false} />)
    .add('fr locale (for legal links)', () => <Subject locale="fr" />)
    .add('in progress', () => <Subject inProgress={true} />)
    .add('all invalid', () => {
      const state = mockValidatorState();

      // HACK: pre-seed with some error messages for display purposes
      state.fields.name.valid = false;
      state.fields.name.error = 'Please enter your name';
      state.fields.zip.valid = false;
      state.fields.zip.error = 'Zip code is too short';
      state.fields.creditCardNumber.valid = false;
      state.fields.creditCardNumber.error = 'Your card number is incomplete';
      state.fields.expDate.valid = false;
      state.fields.expDate.error = "Your card's expiration date is incomplete";
      state.fields.cvc.valid = false;
      state.fields.cvc.error = "Your card's security code is incomplete";

      return <Subject validatorInitialState={state} />;
    });
}

const PRODUCT_ID = 'product_8675309';
const PLAN_ID = 'plan_123';
const PLAN = {
  plan_id: PLAN_ID,
  product_id: PRODUCT_ID,
  product_name: 'Example Product',
  currency: 'USD',
  amount: 1099,
  interval: 'month' as const,
  interval_count: 1,
  product_metadata: {
    'product:termsOfServiceURL':
      'https://www.mozilla.org/en-US/about/legal/terms/services/',
    'product:termsOfServiceURL:fr':
      'https://www.mozilla.org/fr/about/legal/terms/services/',
    'product:privacyNoticeURL':
      'https://www.mozilla.org/en-US/privacy/websites/',
    'product:privacyNoticeURL:fr':
      'https://www.mozilla.org/fr/privacy/websites/',
  },
};

type SubjectProps = {
  inProgress?: boolean;
  confirm?: boolean;
  noPlan?: boolean;
  plan?: Plan;
  onPayment?: (tokenResponse: stripe.TokenResponse) => void;
  onPaymentError?: (error: any) => void;
  onChange?: Function;
  validatorInitialState?: ValidatorState;
  validatorMiddlewareReducer?: ValidatorMiddlewareReducer;
  locale?: string;
};

const Subject = ({
  inProgress = false,
  confirm = true,
  noPlan = false,
  plan = PLAN,
  onPayment = action('onPayment'),
  onPaymentError = action('onPaymentError'),
  validatorInitialState,
  validatorMiddlewareReducer,
  onChange = () => {},
  locale = 'en-US',
}: SubjectProps) => {
  const [submitNonce, refreshSubmitNonce] = useNonce();

  const paymentFormProps: PaymentFormProps = {
    submitNonce,
    inProgress,
    confirm,
    plan: noPlan ? undefined : plan,
    onPayment,
    onPaymentError,
    onChange,
    validatorInitialState,
    validatorMiddlewareReducer,
    onMounted: () => {},
    onEngaged: () => {},
    getString: x => x,
  };
  return (
    <MockPage locale={locale}>
      <div className="product-payment">
        <button onClick={refreshSubmitNonce}>Refresh submit nonce</button>
        <p>Current nonce: {submitNonce}</p>
        <PaymentForm {...paymentFormProps} />
      </div>
    </MockPage>
  );
};

type MockPageProps = {
  locale: string;
  children: React.ReactNode;
};

const MockPage = ({ locale, children }: MockPageProps) => {
  return (
    <MockApp languages={[locale]}>
      <SignInLayout>{children}</SignInLayout>
    </MockApp>
  );
};

const mockValidatorState = (): ValidatorState => ({
  error: null,
  fields: {
    name: {
      value: null,
      valid: null,
      error: null,
      fieldType: 'input',
      required: true,
    },
    zip: {
      value: null,
      valid: null,
      error: null,
      fieldType: 'input',
      required: true,
    },
    creditCardNumber: {
      value: null,
      valid: null,
      error: null,
      fieldType: 'stripe',
      required: true,
    },
    expDate: {
      value: null,
      valid: null,
      error: null,
      fieldType: 'stripe',
      required: true,
    },
    cvc: {
      value: null,
      valid: null,
      error: null,
      fieldType: 'stripe',
      required: true,
    },
    confirm: {
      value: null,
      valid: null,
      error: null,
      fieldType: 'input',
      required: true,
    },
    submit: {
      value: null,
      valid: null,
      error: null,
      fieldType: 'input',
      required: false,
    },
  },
});

init();
