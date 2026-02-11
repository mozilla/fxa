/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Localized } from '@fluent/react';
import React, { useCallback, useState } from 'react';
import { ReactComponent as ValidIcon } from './valid.svg';
import { ReactComponent as InvalidIcon } from './invalid.svg';
import { ReactComponent as UnsetIcon } from './unset.svg';
import { UseFormMethods, ValidateResult } from 'react-hook-form';
import LinkExternal from 'fxa-react/components/LinkExternal';
import InputPassword from '../InputPassword';
import PasswordValidator from '../../lib/password-validator';
import { SETTINGS_PATH } from '../../constants';
import { logViewEvent, settingsViewName } from '../../lib/metrics';
import { useNavigate } from '@reach/router';

type FormPasswordProps = {
  formState: UseFormMethods['formState'];
  errors: UseFormMethods['errors'];
  onSubmit: () => void;
  trigger: UseFormMethods['trigger'];
  register: UseFormMethods['register'];
  getValues: UseFormMethods['getValues'];
  primaryEmail: string;
  newPasswordErrorText?: string;
  setNewPasswordErrorText: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  currentPasswordErrorText?: string;
  setCurrentPasswordErrorText?: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  onFocusMetricsEvent?: string;
  loading: boolean;
};

const ValidationIcon = ({
  isSet,
  hasError,
}: {
  isSet?: boolean;
  hasError: ValidateResult;
}) => {
  if (!isSet) {
    return <UnsetIcon className="inline mr-1" data-testid="icon-unset" />;
  }
  return hasError ? (
    <InvalidIcon className="inline mr-1" data-testid="icon-invalid" />
  ) : (
    <ValidIcon className="inline mr-1" data-testid="icon-valid" />
  );
};

export const FormPassword = ({
  formState,
  errors,
  onSubmit,
  primaryEmail,
  trigger,
  register,
  getValues,
  newPasswordErrorText,
  setNewPasswordErrorText,
  currentPasswordErrorText,
  setCurrentPasswordErrorText,
  onFocusMetricsEvent,
  loading,
}: FormPasswordProps) => {
  const navigate = useNavigate();
  const goHome = useCallback(
    () => navigate(SETTINGS_PATH + '#password', { replace: true }),
    [navigate]
  );
  const passwordValidator = new PasswordValidator(primaryEmail);
  const [hasFocused, setHasFocused] = useState(false);

  const onFocus = () => {
    if (!hasFocused && onFocusMetricsEvent) {
      logViewEvent(settingsViewName, onFocusMetricsEvent);
      setHasFocused(true);
    }
  };

  return (
    <form {...{ onSubmit }}>
      <Localized id="password-strength-balloon-heading">
        <h2>Password requirements</h2>
      </Localized>
      <ul
        className="text-grey-400 text-xs m-3 list-inside"
        data-testid="change-password-requirements"
      >
        <li data-testid="change-password-length">
          <ValidationIcon
            isSet={formState.dirtyFields.newPassword}
            hasError={errors.newPassword?.types?.length}
          />
          <Localized id="pw-8-chars">At least 8 characters</Localized>
        </li>
        <li data-testid="change-password-email">
          <ValidationIcon
            isSet={formState.dirtyFields.newPassword}
            hasError={errors.newPassword?.types?.notEmail}
          />
          <Localized id="pw-not-email">Not your email address</Localized>
        </li>
        <li data-testid="change-password-common">
          <ValidationIcon
            isSet={formState.dirtyFields.newPassword}
            hasError={errors.newPassword?.types?.uncommon}
          />
          <Localized id="pw-commonly-used">
            Not a commonly used password
          </Localized>
        </li>
        <li data-testid="change-password-match">
          <ValidationIcon
            isSet={formState.dirtyFields.confirmPassword}
            hasError={errors.confirmPassword?.types?.validate}
          />
          <Localized id="pw-change-must-match">
            New password matches confirmation
          </Localized>
        </li>
      </ul>

      <Localized
        id="pw-tips"
        elems={{
          linkExternal: (
            <LinkExternal
              className="link-blue"
              data-testid="nav-link-common-passwords"
              href="https://support.mozilla.org/kb/password-strength"
            >
              {' '}
            </LinkExternal>
          ),
        }}
      >
        <p>
          Stay safe — don’t reuse passwords. See more tips to{' '}
          <LinkExternal
            className="link-blue"
            data-testid="nav-link-common-passwords"
            href="https://support.mozilla.org/kb/password-strength"
          >
            create strong passwords
          </LinkExternal>
          .
        </p>
      </Localized>

      <div className="my-6">
        {setCurrentPasswordErrorText && (
          <Localized id="pw-change-current-password" attrs={{ label: true }}>
            <InputPassword
              name="oldPassword"
              label="Enter current password"
              className="mb-2"
              errorText={currentPasswordErrorText}
              onChange={() => {
                if (currentPasswordErrorText) {
                  setCurrentPasswordErrorText(undefined);
                }
                trigger('oldPassword');
              }}
              inputRef={register({
                required: true,
              })}
              prefixDataTestId="current-password"
            />
          </Localized>
        )}

        <Localized id="pw-change-new-password" attrs={{ label: true }}>
          <InputPassword
            name="newPassword"
            label="Enter new password"
            className="mb-2"
            errorText={newPasswordErrorText}
            onFocusCb={onFocusMetricsEvent ? onFocus : undefined}
            onChange={() => {
              if (newPasswordErrorText) {
                setNewPasswordErrorText(undefined);
              }
              trigger(['newPassword', 'confirmPassword']);
            }}
            inputRef={register({
              required: true,
              validate: {
                length: (value: string) => value.length > 7,
                notEmail: (value: string) => {
                  return !passwordValidator.isSameAsEmail(value.toLowerCase());
                },
                uncommon: async (value: string) => {
                  // @ts-ignore
                  const list = await import('fxa-common-password-list');
                  const input = value.toLowerCase();
                  return (
                    !list.test(input) && !passwordValidator.isBanned(input)
                  );
                },
              },
            })}
            prefixDataTestId="new-password"
          />
        </Localized>

        <Localized id="pw-change-confirm-password" attrs={{ label: true }}>
          <InputPassword
            name="confirmPassword"
            label="Confirm new password"
            onChange={() => trigger(['newPassword', 'confirmPassword'])}
            onFocusCb={onFocusMetricsEvent ? onFocus : undefined}
            inputRef={register({
              required: true,
              validate: (value: string) => value === getValues().newPassword,
            })}
            prefixDataTestId="verify-password"
          />
        </Localized>
      </div>

      <div className="flex justify-center mb-4 mx-auto max-w-64">
        <Localized id="pw-change-cancel-button">
          <button
            type="button"
            className="cta-neutral cta-base-p mx-2 flex-1"
            onClick={goHome}
            data-testid="cancel-password-button"
          >
            Cancel
          </button>
        </Localized>
        <Localized id="pw-change-save-button">
          <button
            data-testid="save-password-button"
            type="submit"
            className="cta-primary cta-base-p mx-2 flex-1"
            disabled={!formState.isDirty || !formState.isValid || loading}
          >
            Save
          </button>
        </Localized>
      </div>
    </form>
  );
};

export default FormPassword;
