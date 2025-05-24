// React looks unused here, but we need it for Storybook.
import React, { useCallback, useEffect, useState } from 'react';
import { Localized } from '@fluent/react';

import { isEmailValid } from '../../../../fxa-shared/email/helpers';
import shieldIcon from './images/shield.svg';
import { Form, Input, Checkbox } from '../fields';
import {
  State as ValidatorState,
  useValidatorState,
  MiddlewareReducer as ValidatorMiddlewareReducer,
} from '../../lib/validator';
import * as Amplitude from '../../lib/amplitude';
import { useCallbackOnce } from '../../lib/hooks';
import { apiFetchAccountStatus } from '../../lib/apiClient';
import { CheckoutType } from 'fxa-shared/subscriptions/types';
import { metadataFromPlan } from 'fxa-shared/subscriptions/metadata';
import { ACCESS_TOKEN_KEY } from '../..';

const CHECKOUT_TYPE = CheckoutType.WITHOUT_ACCOUNT;
const DEFAULT_NEWSLETTER_STRING_ID =
  'new-user-subscribe-product-updates-mozilla';

/**
 * The newsletter string is a configurable field. This function returns the correct
 * localization string ID and fallback text for the different newsletter string ID options.
 */
function getNewsletterStringInfo(newsletterLabelTextCode?: string) {
  switch (newsletterLabelTextCode) {
    case 'snp':
      return {
        newsletterStringId: 'new-user-subscribe-product-updates-snp',
        newsletterStringFallbackText: `I’d like to receive security and privacy news and updates from Mozilla`,
      };
    case 'hubs':
      return {
        newsletterStringId: 'new-user-subscribe-product-updates-hubs',
        newsletterStringFallbackText:
          'I’d like to receive product news and updates from Mozilla Hubs and Mozilla',
      };
    case 'mdnplus':
      return {
        newsletterStringId: 'new-user-subscribe-product-updates-mdnplus',
        newsletterStringFallbackText: `I’d like to receive product news and updates from MDN Plus and Mozilla`,
      };
    default:
      return {
        newsletterStringId: DEFAULT_NEWSLETTER_STRING_ID,
        newsletterStringFallbackText: `I’d like to receive product news and updates from Mozilla`,
      };
  }
}

export type NewUserEmailFormProps = {
  getString?: (id: string) => string;
  signInURL: string;
  setValidEmail: (value: string) => void;
  setAccountExists: (value: boolean) => void;
  setInvalidEmailDomain: (value: boolean) => void;
  setEmailsMatch: (value: boolean) => void;
  checkAccountExists: (
    email: string
  ) => Promise<{ exists: boolean; invalidDomain: boolean }>;
  onToggleNewsletterCheckbox: () => void;
  validatorInitialState?: ValidatorState;
  validatorMiddlewareReducer?: ValidatorMiddlewareReducer;
  selectedPlan: any;
};

export const NewUserEmailForm = ({
  getString,
  signInURL,
  setValidEmail,
  setAccountExists,
  setInvalidEmailDomain,
  setEmailsMatch,
  checkAccountExists,
  onToggleNewsletterCheckbox,
  validatorInitialState,
  validatorMiddlewareReducer,
  selectedPlan,
}: NewUserEmailFormProps) => {
  const validator = useValidatorState({
    initialState: validatorInitialState,
    middleware: validatorMiddlewareReducer,
  });

  const [emailInputState, setEmailInputState] = useState<string>();

  const { newsletterStringId, newsletterStringFallbackText } =
    getNewsletterStringInfo(
      metadataFromPlan(selectedPlan).newsletterLabelTextCode
    );

  const onFormMounted = useCallback(
    () =>
      Amplitude.createAccountMounted({
        ...selectedPlan,
        checkoutType: CHECKOUT_TYPE,
      }),
    [selectedPlan]
  );
  useEffect(() => {
    onFormMounted();
  }, [onFormMounted, selectedPlan]);

  const onFormEngaged = useCallbackOnce(
    () =>
      Amplitude.createAccountEngaged({
        ...selectedPlan,
        checkoutType: CHECKOUT_TYPE,
      }),
    [selectedPlan]
  );
  const onChange = useCallback(() => {
    onFormEngaged();
  }, [onFormEngaged]);

  const onClickSignInButton = () => {
    // Clear any remaining access token from a previous session
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    selectedPlan.other = 'click-signnin';
    Amplitude.createAccountSignIn({
      ...selectedPlan,
      checkoutType: CHECKOUT_TYPE,
    });
  };

  return (
    <Form
      data-testid="new-user-email-form"
      validator={validator}
      className="new-user-email-form relative"
      {...{ onChange }}
    >
      <Localized
        id="new-user-sign-in-link-2"
        elems={{
          a: (
            <a
              className="underline text-grey-400 hover:text-grey-400"
              onClick={onClickSignInButton}
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
          Already have a Mozilla account?{' '}
          <a
            className="underline text-grey-400 hover:text-grey-400"
            data-testid="sign-in-link"
            onClick={onClickSignInButton}
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
              setValidEmail,
              setAccountExists,
              setInvalidEmailDomain,
              setEmailInputState,
              checkAccountExists,
              signInURL,
              onClickSignInButton,
              getString
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
              setEmailsMatch,
              getString
            )
          }
        />
      </Localized>

      <Localized id={newsletterStringId}>
        <Checkbox
          data-testid="new-user-subscribe-product-updates"
          name="new-user-subscribe-product-updates"
          onClick={onToggleNewsletterCheckbox}
          className="input-row--checkbox mt-6 my-0 mb-1.5"
        >
          {newsletterStringFallbackText}
        </Checkbox>
      </Localized>

      <div
        className="flex justify-center items-center mb-14 gap-5"
        data-testid="assurance-copy"
      >
        <span className="-mx-2">
          <img src={shieldIcon} alt="shield" />
        </span>
        <Localized id="new-user-subscribe-product-assurance">
          <p className="mb-0">
            We only use your email to create your account. We will never sell it
            to a third party.
          </p>
        </Localized>
      </div>
    </Form>
  );
};

export const checkAccountExists = (() => {
  const results: {
    [key: string]: { exists: boolean; invalidDomain: boolean };
  } = {};
  const memoizedCheck = async (userEmail: string) => {
    if (results[userEmail]) {
      return results[userEmail];
    }
    const res = (results[userEmail] = await apiFetchAccountStatus(userEmail));
    return res;
  };

  return memoizedCheck;
})();

export async function emailInputValidationAndAccountCheck(
  value: string,
  focused: boolean,
  setValidEmail: (value: string) => void,
  setAccountExists: (value: boolean) => void,
  setInvalidEmailDomain: (value: boolean) => void,
  setEmailInputState: (value: string) => void,
  checkAccountExists: (
    email: string
  ) => Promise<{ exists: boolean; invalidDomain: boolean }>,
  signInURL: string,
  onClickSignInButton: () => void,
  getString?: (id: string) => string
) {
  let error: JSX.Element | string | null = null;
  let valid = false;
  let hasAccount = false;
  let invalidEmailDomain = false;
  setEmailInputState(value);
  if (isEmailValid(value)) {
    valid = true;
    setValidEmail(value);
    if (!focused) {
      const response = await checkAccountExists(value);
      if (response?.exists) {
        hasAccount = response.exists;
      } else if (response?.invalidDomain) {
        invalidEmailDomain = response.invalidDomain;
      }
      setInvalidEmailDomain(invalidEmailDomain);
      setAccountExists(hasAccount);
    }
  } else {
    setValidEmail('');
  }

  const errorMsg = getString
    ? /* istanbul ignore next - not testing l10n here */
    getString('new-user-email-validate')
    : 'Email is not valid';

  const accountExistsMsg = (
    <Localized
      id="new-user-already-has-account-sign-in"
      elems={{
        a: (
          <a onClick={onClickSignInButton} href={signInURL}>
            Sign in
          </a>
        ),
      }}
    >
      <>
        You already have an account.{' '}
        <a
          data-testid="already-have-account-link"
          onClick={onClickSignInButton}
          href={signInURL}
        >
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
  setEmailsMatch: (value: boolean) => void,
  getString?: Function
) {
  let valid = false;

  setEmailsMatch((valid = emailInputState === value));

  const errorMsg = getString
    ? /* istanbul ignore next - not testing l10n here */
    getString('new-user-email-validate-confirm')
    : 'Emails do not match';

  return {
    value,
    valid: valid || !value,
    error: !valid && !focused && !!value ? errorMsg : null,
  };
}

export default NewUserEmailForm;
