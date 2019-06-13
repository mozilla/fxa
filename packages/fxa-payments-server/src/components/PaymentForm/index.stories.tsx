import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import MockApp from '../../../.storybook/components/MockApp';
import { SignInLayout } from '../AppLayout';
import PaymentForm, { PaymentFormProps } from './index';
import { 
  State as ValidatorState,
  Action as ValidatorAction,
  ActionReducer as ValidatorReducer,
  MiddlewareReducer as ValidatorMiddlewareReducer,
} from '../../lib/validator';

function init() {
  storiesOf('components/PaymentForm', module)
    .add('default', () => <Subject />)
    .add('in progress', () => <Subject inProgress={true} />)
    .add('all invalid', () => {
      const state = mockValidatorState();
      
      state.fields.name.valid = false;
      state.fields.name.error = 'Please enter your name';
      state.fields.zip.valid = false;
      state.fields.zip.error = 'Zip code is too short';
      state.fields.creditCardNumber.valid = false;
      state.fields.creditCardNumber.error = 'Your card number is incomplete';
      state.fields.expDate.valid = false;
      state.fields.expDate.error = 'Your card\'s expiration date is incomplete.';
      state.fields.cvc.valid = false;
      state.fields.cvc.error = 'Your card\'s security code is incomplete.';
      
      return<Subject validatorInitialState={state} />;
    });
}

type SubjectProps = {
  inProgress?: boolean,
  onPayment?: (tokenResponse: stripe.TokenResponse) => void,
  onPaymentError?: (error: any) => void,
  validatorInitialState?: ValidatorState,
  validatorMiddlewareReducer?: ValidatorMiddlewareReducer,
};

const Subject = ({
  inProgress = false,
  onPayment = action('onPayment'),
  onPaymentError = action('onPaymentError'),
  validatorInitialState,
  validatorMiddlewareReducer,
}: SubjectProps) => {
  const paymentFormProps: PaymentFormProps = {
    inProgress,
    onPayment,
    onPaymentError,
    validatorInitialState,
    validatorMiddlewareReducer,
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

const mockValidatorState = (): ValidatorState => (
  {
    "error": null,
    "fields": {
      "name": {
        "value": null,
        "valid": null,
        "error": null,
        "fieldType": "input",
        "required": true
      },
      "zip": {
        "value": null,
        "valid": null,
        "error": null,
        "fieldType": "input",
        "required": true
      },
      "creditCardNumber": {
        "value": null,
        "valid": null,
        "error": null,
        "fieldType": "stripe",
        "required": true
      },
      "expDate": {
        "value": null,
        "valid": null,
        "error": null,
        "fieldType": "stripe",
        "required": true
      },
      "cvc": {
        "value": null,
        "valid": null,
        "error": null,
        "fieldType": "stripe",
        "required": true
      },
      "confirm": {
        "value": null,
        "valid": null,
        "error": null,
        "fieldType": "input",
        "required": true
      },
      "submit": {
        "value": null,
        "valid": null,
        "error": null,
        "fieldType": "input",
        "required": false
      }
    }
  }
);

init();