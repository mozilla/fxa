import React, { useCallback } from 'react';
import {
  injectStripe,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
  Elements,
  ReactStripeElements
} from 'react-stripe-elements';
import { Form, FieldGroup, Input, StripeElement, SubmitButton, Checkbox } from '../fields';
import {
  State as ValidatorState,
  MiddlewareReducer as ValidatorMiddlewareReducer,
  useValidatorState,
} from '../../lib/validator';

import './index.scss';

// ref: https://stripe.com/docs/stripe-js/reference#the-elements-object
const STRIPE_ELEMENT_STYLES = {
  base: {
    //TODO: Figure out what this really should be - I just copied it from computed styles because CSS can't apply through the iframe
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: '16px',
    lineHeight: '48px',
  }
};

export type PaymentFormProps = {
  inProgress?: boolean,
  onPayment: (tokenResponse: stripe.TokenResponse) => void,
  onPaymentError: (error: any) => void,
  validatorInitialState?: ValidatorState,
  validatorMiddlewareReducer?: ValidatorMiddlewareReducer,
} & ReactStripeElements.InjectedStripeProps;

export const PaymentForm = ({
  inProgress = false,
  onPayment,
  onPaymentError,
  validatorInitialState,
  validatorMiddlewareReducer,
  stripe,
}: PaymentFormProps) => {
  const validator = useValidatorState({
    initialState: validatorInitialState,
    middleware: validatorMiddlewareReducer,
  });

  const onSubmit = useCallback(ev => {
    ev.preventDefault();
    if (! validator.allValid()) {
      return;
    }
    const { name, zip } = validator.getValues();
    if (stripe) {
      stripe
        .createToken({ name, address_zip: zip })
        .then(onPayment)
        .catch(onPaymentError);
    }
  }, [ validator, onPayment, onPaymentError, stripe ]);

  return (
    <Form data-testid="paymentForm" validator={validator} onSubmit={onSubmit} className="payment">

      <h3><span>Billing information</span></h3>

      <Input type="text" name="name" label="Name as it appears on your card"
        data-testid="name"
        required autoFocus spellCheck={false} 
        onValidate={value => {
          let error = null;
          if (value !== null && ! value) {
            error = 'Please enter your name';
          }
          return { value, error };
        }} />

      <FieldGroup>

        <StripeElement component={CardNumberElement}
          name="creditCardNumber" label="Credit Card Number"
          style={STRIPE_ELEMENT_STYLES}
          className="input-row input-row--xl" required />

        <StripeElement component={CardExpiryElement}
          name="expDate" label="Exp. Date"
          style={STRIPE_ELEMENT_STYLES} required />

        <StripeElement component={CardCVCElement}
          name="cvc" label="CVC"
          style={STRIPE_ELEMENT_STYLES} required />

        <Input type="number" name="zip" label="Zip Code" maxLength={5} required
          data-testid="zip"
          onValidate={value => {
            let error = null;
            if (value !== null) {
              value = ('' + value).substr(0, 5);
              if (! value) {
                error = 'Zip code is required';
              }
              if (value.length !== 5) {
                error = 'Zip code is too short';
              }
            }
            return { value, error };
          }}
        />

      </FieldGroup>
     
      <Checkbox name="confirm" required label={`
        I authorize Mozilla, maker of Firefox products, to charge my
        payment method [cost] per [time frame], according to payment
        terms, until I cancel my subscription.
      `} />

      <SubmitButton name="submit" disabled={inProgress}>
        {inProgress ? (
          <span className="spinner">&nbsp;</span>
        ) : (
          <span>Submit</span>
        )}
      </SubmitButton>

    </Form>
  );
};

const InjectedPaymentForm = injectStripe(PaymentForm);

const WrappedPaymentForm = (props: PaymentFormProps) => (
  <Elements>
    <InjectedPaymentForm {...props} />
  </Elements>
);

export default WrappedPaymentForm;
