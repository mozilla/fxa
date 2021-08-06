import React, { Dispatch, SetStateAction, useState } from 'react';
import { Localized } from '@fluent/react';

import { isEmailValid } from '../../../../fxa-shared/email/helpers';

import shieldIcon from './images/shield.svg';

import { Form, Input, Checkbox } from '../fields';
import {
  State as ValidatorState,
  useValidatorState,
  MiddlewareReducer as ValidatorMiddlewareReducer,
} from '../../lib/validator';

import './index.scss';
import { config } from '../../lib/config';

export type NewUserEmailFormProps = {
  getString?: (id: string) => string;
  signInURL: string;
  setValidEmail: (value: string) => void;
  setAccountExists: (value: boolean) => void;
  checkAccountExists: (email: string) => Promise<{ exists: boolean }>;
  validatorInitialState?: ValidatorState;
  validatorMiddlewareReducer?: ValidatorMiddlewareReducer;
};

export const NewUserEmailForm = ({
  getString,
  signInURL,
  setValidEmail,
  setAccountExists,
  checkAccountExists,
  validatorInitialState,
  validatorMiddlewareReducer,
}: NewUserEmailFormProps) => {
  const validator = useValidatorState({
    initialState: validatorInitialState,
    middleware: validatorMiddlewareReducer,
  });

  const [emailInputState, setEmailInputState] = useState<string>();

  return (
    <Form
      data-testid="new-user-email-form"
      validator={validator}
      className="new-user-email-form"
    >
      <Localized
        id="new-user-sign-in-link"
        elems={{ a: <a href={signInURL}></a> }}
      >
        <p className="sign-in-copy" data-testid="sign-in-copy">
          Already have a Firefox account? <a href={signInURL}>Sign in</a>
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
          onValidatePromise={(value, focused) => {
            return emailInputValidationAndAccountCheck(
              value,
              focused,
              setValidEmail,
              setAccountExists,
              setEmailInputState,
              checkAccountExists,
              getString
            );
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
          onValidate={(value, focused) => {
            return emailConfirmationValidation(
              value,
              focused,
              emailInputState,
              getString
            );
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
        <Localized id="new-user-subscribe-product-assurance">
          <p>
            We only use your email to create your account. We will never sell it
            to a third party.
          </p>
        </Localized>
      </div>
    </Form>
  );
};

export async function checkAccountExists(userEmail: string) {
  const response = await fetch(`${config.servers.auth.url}/v1/account/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: userEmail }),
  });
  return response.json();
}

export async function emailInputValidationAndAccountCheck(
  value: string,
  focused: boolean,
  setValidEmail: (value: string) => void,
  setAccountExists: (value: boolean) => void,
  setEmailInputState: (value: string) => void,
  checkAccountExists: (email: string) => Promise<{ exists: boolean }>,
  getString?: (id: string) => string
) {
  let error = null;
  let valid = false;
  let hasAccount = false;
  setEmailInputState(value);
  if (isEmailValid(value)) {
    valid = true;
    setValidEmail(value);
    const response = await checkAccountExists(value);
    hasAccount = response.exists;
    setAccountExists(response.exists);
  } else {
    setValidEmail('');
  }

  const errorMsg = getString
    ? /* istanbul ignore next - not testing l10n here */
      getString('new-user-email-validate')
    : 'Email is not valid';

  const accountExistsMsg = getString
    ? getString('new-user-existing-account-sign-in')
    : `You already have an account, <a>Sign in</a>`;

  if (!valid && !focused && errorMsg) {
    error = errorMsg;
  }

  if (hasAccount) {
    error = accountExistsMsg;
  }

  return {
    value,
    valid,
    error,
  };
}

export function emailConfirmationValidation(
  value: string,
  focused: boolean,
  emailInputState: string | undefined,
  getString?: Function
) {
  let valid = false;

  valid = emailInputState === value;

  const errorMsg = getString
    ? /* istanbul ignore next - not testing l10n here */
      getString('new-user-email-validate-confirm')
    : 'Emails do not match';

  return {
    value,
    valid,
    error: !valid && !focused ? errorMsg : null,
  };
}

export default NewUserEmailForm;
