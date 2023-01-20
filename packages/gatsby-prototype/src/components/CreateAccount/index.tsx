import React, { useCallback, useState } from 'react';
import { Localized } from '@fluent/react';
import { Checkbox, Input } from '../fields';
import shieldIcon from '../../images/shield.svg';

const CreateAccount = () => (
  <>
    <Localized id="new-user-step-1">
      <h2 className="font-semibold text-lg tablet:mt-10">
        1. Create a Firefox account
      </h2>
    </Localized>

    <Localized
      id="new-user-sign-in-link"
      elems={{
        a: (
          <a
            className="underline text-grey-400 hover:text-grey-400"
            // onClick={onClickSignInButton}
            // href={signInURL}
          >
            Sign in
          </a>
        ),
      }}
    >
      <p className="-mt-2 text-grey-400" data-testid="sign-in-copy">
        Already have a Firefox account?{' '}
        <a
          className="underline text-grey-400 hover:text-grey-400"
          data-testid="sign-in-link"
          // onClick={onClickSignInButton}
          // href={signInURL}
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
        // onValidatePromise={(value: string, focused: boolean) =>
        //   emailInputValidationAndAccountCheck(
        //     value,
        //     focused,
        //     setValidEmail,
        //     setAccountExists,
        //     setInvalidEmailDomain,
        //     setEmailInputState,
        //     checkAccountExists,
        //     signInURL,
        //     onClickSignInButton,
        //     getString
        //   )
        // }
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
        // onValidate={(value: string, focused: boolean) =>
        //   emailConfirmationValidation(
        //     value,
        //     focused,
        //     emailInputState,
        //     setEmailsMatch,
        //     getString
        //   )
        // }
      />
    </Localized>

    <Localized id="new-user-subscribe-product-updates">
      <Checkbox
        data-testid="new-user-subscribe-product-updates"
        name="new-user-subscribe-product-updates"
        // onClick={onToggleNewsletterCheckbox}
      >
        I'd like to receive product updates from Firefox
      </Checkbox>
    </Localized>

    <div
      className="flex justify-center items-center"
      data-testid="assurance-copy"
    >
      <img src={shieldIcon} alt="shield" />

      <Localized id="new-user-subscribe-product-assurance">
        <p className="text-sm">
          We only use your email to create your account. We will never sell it
          to a third party.
        </p>
      </Localized>
    </div>
  </>
);

export default CreateAccount;
