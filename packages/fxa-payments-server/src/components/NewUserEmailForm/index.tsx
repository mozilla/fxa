import React from 'react';
import { Localized } from '@fluent/react';

import shieldIcon from './images/shield.svg';

import { Form, Input, Checkbox, OnValidateFunction } from '../fields';
import {
  State as ValidatorState,
  useValidatorState,
  MiddlewareReducer as ValidatorMiddlewareReducer,
} from '../../lib/validator';

import './index.scss';

export type NewUserEmailFormProps = {
  validatorInitialState?: ValidatorState;
  validatorMiddlewareReducer?: ValidatorMiddlewareReducer;
};

export const NewUserEmailForm = ({
  validatorInitialState,
  validatorMiddlewareReducer,
}: NewUserEmailFormProps) => {
  const validator = useValidatorState({
    initialState: validatorInitialState,
    middleware: validatorMiddlewareReducer,
  });

  return (
    <Form
      data-testid="new-user-email-form"
      validator={validator}
      className="new-user-email-form"
    >
      <Localized id="new-user-sign-in-link">
        <p className="sign-in-copy" data-testid="sign-in-copy">
          Already have a Firefox account? <a>Sign in</a>
        </p>
      </Localized>
      <Localized id="new-user-email" attrs={{ placeholder: true, label: true }}>
        <Input
          type="email"
          name="new-user-email"
          label="Enter your email"
          data-testid="new-user-email"
          placeholder="foxy@mozilla.com"
          required
          spellCheck={false}
          onValidate={(value) => {
            return {
              value,
              valid: true,
              error: null,
            };
          }}
        />
      </Localized>

      <Localized id="new-user-confirm-email" attrs={{ label: true }}>
        <Input
          type="email"
          name="new-user-confirm-email"
          label="Confirm your email"
          data-testid="new-user-confirm-email"
          required
          spellCheck={false}
          onValidate={(value) => {
            return {
              value,
              valid: true,
              error: null,
            };
          }}
        />
      </Localized>

      <Localized id="new-user-subscribe-product-updates">
        <Checkbox
          data-testid="new-user-subscribe-product-updates"
          name="new-user-subscribe-product-updates"
        >
          I'd like to receive product updates from Firefox
        </Checkbox>
      </Localized>

      <div className="assurance-copy" data-testid="assurance-copy">
        <img src={shieldIcon} alt="shield" />
        <Localized id="new-user-subscribe-product-updates">
          <p>
            We only use your email to create your account. We will never sell it
            to a third party.
          </p>
        </Localized>
      </div>
    </Form>
  );
};

export default NewUserEmailForm;
