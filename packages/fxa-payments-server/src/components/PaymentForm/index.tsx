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
import { Plan } from '../../store/types';

// ref: https://stripe.com/docs/stripe-js/reference#the-elements-object
const STRIPE_ELEMENT_STYLES = {
  base: {
    //TODO: Figure out what this really should be - I just copied it from computed styles because CSS can't apply through the iframe
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: '13px',
    fontWeight: '500',
    lineHeight: '45px',
  }
};

export type PaymentFormProps = {
  inProgress?: boolean,
  confirm?: boolean,
  plan?: Plan,
  onCancel?: () => void,
  onPayment: (tokenResponse: stripe.TokenResponse, name: string) => void,
  onPaymentError: (error: any) => void,
  validatorInitialState?: ValidatorState,
  validatorMiddlewareReducer?: ValidatorMiddlewareReducer,
} & ReactStripeElements.InjectedStripeProps;

export const PaymentForm = ({
  inProgress = false,
  confirm = true,
  plan,
  onCancel,
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
        .then((tokenResponse: stripe.TokenResponse) => onPayment(tokenResponse, name))
        .catch(onPaymentError);
    }
  }, [ validator, onPayment, onPaymentError, stripe ]);

  return (
    <Form data-testid="paymentForm" validator={validator} onSubmit={onSubmit} className="payment">

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
          name="creditCardNumber" label="Card number"
          style={STRIPE_ELEMENT_STYLES}
          className="input-row input-row--xl" required />

        <StripeElement component={CardExpiryElement}
          name="expDate" label="Exp. date"
          style={STRIPE_ELEMENT_STYLES} required />

        <StripeElement component={CardCVCElement}
          name="cvc" label="CVC"
          style={STRIPE_ELEMENT_STYLES} required />

        <Input type="number" name="zip" label="Zip code" maxLength={5} required
          data-testid="zip"
          onValidate={value => {
            let error = null;
            if (value !== null) {
              value = ('' + value).substr(0, 5);
              if (!value) {
                error = 'Zip code is required';
              } else if (value.length !== 5) {
                error = 'Zip code is too short';
              }
            }
            return { value, error };
          }}
        />

      </FieldGroup>

      {confirm && plan &&
        <Checkbox name="confirm" required label={`
          I authorize Mozilla, maker of Firefox products, to charge my
          payment method $${plan.amount / 100.0} per ${plan.interval}, according to payment
          terms, until I cancel my subscription.
        `} />
      }

      {onCancel ? (
        <div className="button-row">
          <button className="settings-button cancel secondary-button" onClick={onCancel}>Cancel</button>
          <SubmitButton className="settings-button primary-button" name="submit" disabled={inProgress}>
            {inProgress ? (
              <span className="spinner">&nbsp;</span>
            ) : (
              <span>Update</span>
            )}
          </SubmitButton>
        </div>
      ) : (
        <div className="button-row">
          <SubmitButton name="submit" disabled={inProgress}>
            {inProgress ? (
              <span className="spinner">&nbsp;</span>
            ) : (
              <span>Submit</span>
            )}
          </SubmitButton>
        </div>
      )}

      <div className="legal-blurb">
        Mozilla uses Stripe for secure payment processing.
        <br />
        View the <a href="https://stripe.com/privacy">Stripe privacy policy</a>.
      </div>

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
