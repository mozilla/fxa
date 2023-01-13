import { useState, useEffect } from 'react';
import { Localized } from '@fluent/react';
import { Form, Input, Checkbox } from '../fields';
import { isEmailValid } from 'fxa-shared/email/helpers';
import {
  State as ValidatorState,
  useValidatorState,
  MiddlewareReducer as ValidatorMiddlewareReducer,
} from '../../lib/validator';

const SHIELD_ICON = '/images/shield.svg';

export type NewUserEmailFormProps = {
  signInURL: string;
  checkAccountExists: (
    email: string
  ) => Promise<{ exists: boolean; invalidDomain: boolean }>;
  onToggleNewsletterCheckbox: () => void;
  setEmailOk: (value: boolean) => void;
  validatorInitialState?: ValidatorState;
  validatorMiddlewareReducer?: ValidatorMiddlewareReducer;
};

export default function NewUserEmailForm({
  signInURL,
  checkAccountExists,
  onToggleNewsletterCheckbox,
  setEmailOk,
  validatorInitialState,
  validatorMiddlewareReducer,
}: NewUserEmailFormProps) {
  const validator = useValidatorState({
    initialState: validatorInitialState,
    middleware: validatorMiddlewareReducer,
  });

  const [emailInputState, setEmailInputState] = useState<string>();
  const [emailValid, setEmailValid] = useState(false);
  const [emailsMatch, setEmailsMatch] = useState(false);

  useEffect(() => {
    if (emailValid && emailsMatch) {
      setEmailOk(true);
    } else {
      setEmailOk(false);
    }
  }, [emailValid, emailsMatch]);

  return (
    <Form
      data-testid="new-user-email-form"
      validator={validator}
      className="new-user-email-form relative"
    >
      <Localized
        id="new-user-sign-in-link"
        elems={{
          a: (
            <a
              className="underline text-grey-400 hover:text-grey-400"
              href={signInURL}
            >
              Sign in
            </a>
          ),
        }}
      >
        <p
          className="font-normal -mt-2 text-grey-400"
          data-testid="sign-in-copy"
        >
          Already have a Firefox account?{' '}
          <a
            className="underline text-grey-400 hover:text-grey-400"
            data-testid="sign-in-link"
            href={signInURL}
          >
            Sign in
          </a>
        </p>
      </Localized>

      <hr className="mx-auto w-full" />

      <Localized id="new-user-enter-email" attrs={{ label: true }}>
        <Input
          type="text"
          name="new-user-enter-email"
          label="Enter your email"
          data-testid="new-user-enter-email"
          required
          spellCheck={false}
          onValidatePromise={(value: string, focused: boolean) =>
            emailInputValidationAndAccountCheck(
              value,
              focused,
              setEmailInputState,
              setEmailValid,
              checkAccountExists,
              signInURL
            )
          }
        />
      </Localized>

      <Localized id="new-user-confirm-email" attrs={{ label: true }}>
        <Input
          type="text"
          name="new-user-confirm-email"
          label="Confirm your email"
          data-testid="new-user-confirm-email"
          required
          spellCheck={false}
          onValidate={(value: string, focused: boolean) =>
            emailConfirmationValidation(
              value,
              focused,
              emailInputState,
              setEmailsMatch
            )
          }
        />
      </Localized>

      <Localized id="new-user-subscribe-product-updates">
        <Checkbox
          data-testid="new-user-subscribe-product-updates"
          name="new-user-subscribe-product-updates"
          onClick={onToggleNewsletterCheckbox}
        >
          I'd like to receive product updates from Firefox
        </Checkbox>
      </Localized>

      <div
        className="flex justify-center items-center"
        data-testid="assurance-copy"
      >
        <img src={SHIELD_ICON} alt="shield" />
        <Localized id="new-user-subscribe-product-assurance">
          <p>
            We only use your email to create your account. We will never sell it
            to a third party.
          </p>
        </Localized>
      </div>
    </Form>
  );
}

export async function emailInputValidationAndAccountCheck(
  value: string,
  focused: boolean,
  setEmailInputState: (value: string) => void,
  setEmailValid: (value: boolean) => void,
  checkAccountExists: (
    email: string
  ) => Promise<{ exists: boolean; invalidDomain: boolean }>,
  signInURL: string
) {
  let error = null;
  let valid = false;
  let hasAccount = false;
  let invalidEmailDomain = false;
  setEmailInputState(value);
  if (isEmailValid(value)) {
    valid = true;
    if (!focused) {
      const response = await checkAccountExists(value);
      if (response?.exists) {
        hasAccount = response.exists;
      } else if (response?.invalidDomain) {
        invalidEmailDomain = response.invalidDomain;
      }
    }
  } else {
    valid = false;
  }

  // const errorMsg = getString
  //   ? /* istanbul ignore next - not testing l10n here */
  //     getString('new-user-email-validate')
  //   : 'Email is not valid';
  const errorMsg = 'Email is not valid';

  const accountExistsMsg = (
    <Localized
      id="new-user-already-has-account-sign-in"
      elems={{
        a: <a href={signInURL}>Sign in</a>,
      }}
    >
      <>
        You already have an account.{' '}
        <a data-testid="already-have-account-link" href={signInURL}>
          Sign in
        </a>
      </>
    </Localized>
  );

  const invalidEmailDomainMsg = (
    <Localized
      id="new-user-invalid-email-domain"
      vars={{ domain: value.split('@')[1] }}
    >
      <>{`Mistyped email? ${value.split('@')[1]} does not provide email.`}</>
    </Localized>
  );

  if (!valid && !focused && errorMsg) {
    error = errorMsg;
  }

  if (hasAccount) {
    error = accountExistsMsg;
  } else if (invalidEmailDomain) {
    error = invalidEmailDomainMsg;
  }

  if (valid && !error) {
    setEmailValid(true);
  } else {
    setEmailValid(false);
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
  setEmailsMatch: (value: boolean) => void
) {
  let valid = false;

  setEmailsMatch((valid = emailInputState === value));

  // const errorMsg = getString
  //   ? /* istanbul ignore next - not testing l10n here */
  //     getString('new-user-email-validate-confirm')
  //   : 'Emails do not match';
  const errorMsg = 'Emails do not match';

  return {
    value,
    valid: valid || !value,
    error: !valid && !focused && !!value ? errorMsg : null,
  };
}
