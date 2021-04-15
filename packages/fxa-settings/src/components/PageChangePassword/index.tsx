/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState } from 'react';
import { useForm, ValidateResult } from 'react-hook-form';
import { RouteComponentProps, useNavigate } from '@reach/router';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { HomePath } from '../../constants';
import {
  logViewEvent,
  settingsViewName,
  usePageViewEvent,
} from '../../lib/metrics';
import { useAccount, useAlertBar } from '../../models';
import FlowContainer from '../FlowContainer';
import InputPassword from '../InputPassword';
import PasswordValidator from './PasswordValidator';
import { ReactComponent as ValidIcon } from './valid.svg';
import { ReactComponent as InvalidIcon } from './invalid.svg';
import { ReactComponent as UnsetIcon } from './unset.svg';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { useLocalization, Localized } from '@fluent/react';

type FormData = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
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

// eslint-disable-next-line no-empty-pattern
export const PageChangePassword = ({}: RouteComponentProps) => {
  usePageViewEvent('settings.change-password');
  const {
    handleSubmit,
    register,
    getValues,
    setValue,
    errors,
    formState,
    trigger,
  } = useForm<FormData>({
    mode: 'onTouched',
    criteriaMode: 'all',
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  const alertBar = useAlertBar();
  const [currentPasswordErrorText, setCurrentPasswordErrorText] = useState<
    string
  >();
  const [newPasswordErrorText, setNewPasswordErrorText] = useState<string>();
  const account = useAccount();
  const navigate = useNavigate();
  const goHome = useCallback(
    () => navigate(HomePath + '#password', { replace: true }),
    [navigate]
  );
  const { l10n } = useLocalization();
  const alertSuccessAndGoHome = useCallback(() => {
    alertBar.success(
      l10n.getString('pw-change-success-alert', null, 'Password updated.')
    );
    navigate(HomePath + '#password', { replace: true });
  }, [alertBar, l10n, navigate]);
  const passwordValidator = new PasswordValidator(account.primaryEmail.email);
  const onFormSubmit = useCallback(
    async ({ oldPassword, newPassword }: FormData) => {
      if (oldPassword === newPassword) {
        const localizedError = l10n.getString(
          `auth-error-${AuthUiErrors.PASSWORDS_MUST_BE_DIFFERENT.errno}`,
          null,
          AuthUiErrors.PASSWORDS_MUST_BE_DIFFERENT.message
        );
        setNewPasswordErrorText(localizedError);
        return;
      }
      try {
        await account.changePassword(oldPassword, newPassword);
        logViewEvent(settingsViewName, 'change-password.success');
        alertSuccessAndGoHome();
      } catch (e) {
        const localizedError = l10n.getString(
          `auth-error-${AuthUiErrors.INCORRECT_PASSWORD.errno}`,
          null,
          AuthUiErrors.INCORRECT_PASSWORD.message
        );
        if (e.errno === AuthUiErrors.INCORRECT_PASSWORD.errno) {
          // incorrect password
          setCurrentPasswordErrorText(localizedError);
          setValue('oldPassword', '');
        } else {
          alertBar.error(localizedError);
        }
      }
    },
    [
      l10n,
      setNewPasswordErrorText,
      account,
      alertSuccessAndGoHome,
      setCurrentPasswordErrorText,
      setValue,
      alertBar,
    ]
  );

  return (
    <Localized id="pw-change-header" attrs={{ title: true }}>
      <FlowContainer title="Change password">
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <Localized id="pw-change-stay-safe">
            <h1>Stay safe — don’t reuse passwords. Your password:</h1>
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
              <Localized id="pw-change-least-8-chars">
                Must be at least 8 characters
              </Localized>
            </li>
            <li data-testid="change-password-email">
              <ValidationIcon
                isSet={formState.dirtyFields.newPassword}
                hasError={errors.newPassword?.types?.notEmail}
              />
              <Localized id="pw-change-not-contain-email">
                Must not be your email address
              </Localized>
            </li>
            <li data-testid="change-password-common">
              <ValidationIcon
                isSet={formState.dirtyFields.newPassword}
                hasError={errors.newPassword?.types?.uncommon}
              />
              <Localized
                id="pw-change-common-passwords"
                elems={{
                  linkExternal: (
                    <LinkExternal
                      className="link-blue"
                      data-testid="nav-link-common-passwords"
                      href="https://support.mozilla.org/en-US/kb/password-strength"
                    >
                      {' '}
                    </LinkExternal>
                  ),
                }}
              >
                <span>
                  Must not match this{' '}
                  <LinkExternal
                    className="link-blue"
                    data-testid="nav-link-common-passwords"
                    href="https://support.mozilla.org/en-US/kb/password-strength"
                  >
                    list of common passwords
                  </LinkExternal>
                </span>
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

          <div className="my-6">
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
            <Localized id="pw-change-new-password" attrs={{ label: true }}>
              <InputPassword
                name="newPassword"
                label="Enter new password"
                className="mb-2"
                errorText={newPasswordErrorText}
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
                      return !passwordValidator.isSameAsEmail(
                        value.toLowerCase()
                      );
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
                inputRef={register({
                  required: true,
                  validate: (value) => value === getValues().newPassword,
                })}
                prefixDataTestId="verify-password"
              />
            </Localized>
          </div>

          <div className="flex justify-center mb-4 mx-auto max-w-64">
            <Localized id="pw-change-cancel-button">
              <button
                type="button"
                className="cta-neutral mx-2 flex-1"
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
                className="cta-primary mx-2 flex-1"
                disabled={
                  !formState.isDirty || !formState.isValid || account.loading
                }
              >
                Save
              </button>
            </Localized>
          </div>

          <Localized id="pw-change-forgot-password-link">
            <a
              className="link-blue text-sm justify-center flex mobileLandscape:w-max"
              data-testid="nav-link-reset-password"
              href="/reset_password"
            >
              Forgot password?
            </a>
          </Localized>
        </form>
      </FlowContainer>
    </Localized>
  );
};

export default PageChangePassword;
