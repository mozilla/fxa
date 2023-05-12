import React from 'react';
import { Meta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import MockApp from '../../../.storybook/components/MockApp';
import PaymentForm, { PaymentFormProps } from './index';
import { State as ValidatorState } from '../../lib/validator';
import { useNonce } from '../../lib/hooks';
import { SignInLayout } from '../AppLayout';
import { CUSTOMER, SELECTED_PLAN } from '../../lib/mock-data';

export default {
  title: 'components/PaymentFormV2',
  component: PaymentForm,
} as Meta;

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
    creditCard: {
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

type MostPaymentFormProps = Omit<PaymentFormProps, 'submitNonce'>;

const defaultPaymentFormProps: MostPaymentFormProps = {
  locale: 'auto',
  inProgress: false,
  confirm: false,
  customer: undefined,
  plan: SELECTED_PLAN,
  onSubmit: action('onSubmit'),
  onChange: () => {},
  onMounted: () => {},
  onEngaged: () => {},
  getString: (x: string) => x,
};

const storyWithProps = (paymentFormProps: MostPaymentFormProps) => {
  return () => {
    const [submitNonce, refreshSubmitNonce] = useNonce();
    const { locale } = paymentFormProps;
    return (
      <MockApp languages={[locale || 'auto']}>
        <SignInLayout>
          <div className="product-payment">
            <button className="button" onClick={refreshSubmitNonce}>
              Refresh submit nonce
            </button>
            <p>Current nonce: {submitNonce}</p>
            <PaymentForm {...paymentFormProps} submitNonce={submitNonce} />
          </div>
        </SignInLayout>
      </MockApp>
    );
  };
};

export const Default = storyWithProps(defaultPaymentFormProps);

export const WithExistingCard = storyWithProps({
  ...defaultPaymentFormProps,
  customer: CUSTOMER,
});

export const WithoutPlan = storyWithProps({
  ...defaultPaymentFormProps,
  plan: undefined,
});

export const WithoutConfirmation = storyWithProps({
  ...defaultPaymentFormProps,
  confirm: false,
});

export const FrLocale = storyWithProps({
  ...defaultPaymentFormProps,
  locale: 'fr',
});

export const DeLocale = storyWithProps({
  ...defaultPaymentFormProps,
  locale: 'de',
});

export const EsARLocale = storyWithProps({
  ...defaultPaymentFormProps,
  locale: 'es-AR',
});

export const PtBRLocale = storyWithProps({
  ...defaultPaymentFormProps,
  locale: 'pt-BR',
});

export const InProgress = storyWithProps({
  ...defaultPaymentFormProps,
  inProgress: true,
});

const state = mockValidatorState();

// HACK: pre-seed with some error messages for display purposes
state.fields.name.valid = false;
state.fields.name.error = 'Please enter your name';
state.fields.creditCard.valid = false;
state.fields.creditCard.error = 'Your card number is incomplete';

export const AllInvalid = storyWithProps({
  ...defaultPaymentFormProps,
  validatorInitialState: state,
});
