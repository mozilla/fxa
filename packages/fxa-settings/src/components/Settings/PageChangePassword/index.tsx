/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { HomePath } from '../../../constants';
import {
  logViewEvent,
  settingsViewName,
  usePageViewEvent,
} from '../../../lib/metrics';
import { useAccount, useAlertBar } from '../../../models';
import FlowContainer from '../FlowContainer';
import {
  AuthUiErrors,
  getErrorFtlId,
} from '../../../lib/auth-errors/auth-errors';
import { useLocalization, Localized } from '@fluent/react';
import FormPassword from '../../FormPassword';

type FormData = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
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
  const [currentPasswordErrorText, setCurrentPasswordErrorText] =
    useState<string>();
  const [newPasswordErrorText, setNewPasswordErrorText] = useState<string>();
  const account = useAccount();
  const navigate = useNavigate();

  const { l10n } = useLocalization();
  const alertSuccessAndGoHome = useCallback(() => {
    alertBar.success(
      l10n.getString('pw-change-success-alert-2', null, 'Password updated')
    );
    navigate(HomePath + '#password', { replace: true });
  }, [alertBar, l10n, navigate]);

  const onFormSubmit = useCallback(
    async ({ oldPassword, newPassword }: FormData) => {
      if (oldPassword === newPassword) {
        const localizedError = l10n.getString(
          getErrorFtlId(AuthUiErrors.PASSWORDS_MUST_BE_DIFFERENT),
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
          getErrorFtlId(AuthUiErrors.INCORRECT_PASSWORD),
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
        <FormPassword
          {...{
            formState,
            errors,
            trigger,
            register,
            getValues,
            currentPasswordErrorText,
            setCurrentPasswordErrorText,
            newPasswordErrorText,
            setNewPasswordErrorText,
          }}
          onSubmit={handleSubmit(onFormSubmit)}
          primaryEmail={account.primaryEmail.email}
          loading={account.loading}
        />

        <Localized id="pw-change-forgot-password-link">
          <a
            className="link-blue text-sm justify-center flex w-max my-0 mx-auto"
            data-testid="nav-link-reset-password"
            href="/reset_password"
          >
            Forgot password?
          </a>
        </Localized>
      </FlowContainer>
    </Localized>
  );
};

export default PageChangePassword;
