/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Localized, useLocalization } from '@fluent/react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { HomePath } from '../../../constants';
import {
  logViewEvent,
  settingsViewName,
  usePageViewEvent,
} from '../../../lib/metrics';
import { useAccount, useAlertBar } from '../../../models';
import FlowContainer from '../FlowContainer';
import FormPassword from '../FormPassword';

type FormData = {
  newPassword: string;
  confirmPassword: string;
};

// eslint-disable-next-line no-empty-pattern
export const PageCreatePassword = ({}: RouteComponentProps) => {
  usePageViewEvent('settings.create-password');

  const { handleSubmit, register, getValues, errors, formState, trigger } =
    useForm<FormData>({
      mode: 'onTouched',
      criteriaMode: 'all',
      defaultValues: {
        newPassword: '',
        confirmPassword: '',
      },
    });
  const [newPasswordErrorText, setNewPasswordErrorText] = useState<string>();

  const alertBar = useAlertBar();
  const account = useAccount();
  const navigate = useNavigate();
  const { l10n } = useLocalization();

  const alertSuccessAndGoHome = useCallback(() => {
    alertBar.success(
      l10n.getString('pw-create-success-alert-2', null, 'Password set')
    );
    navigate(HomePath + '#password', { replace: true });
  }, [alertBar, l10n, navigate]);

  const onFormSubmit = useCallback(
    async ({ newPassword }: FormData) => {
      try {
        logViewEvent(settingsViewName, 'create-password.submit');
        await account.createPassword(newPassword);
        logViewEvent(settingsViewName, 'create-password.success');
        alertSuccessAndGoHome();
      } catch (e) {
        logViewEvent(settingsViewName, 'create-password.fail');
        alertBar.error(
          l10n.getString(
            'pw-create-error-2',
            null,
            'Sorry, there was a problem setting your password'
          )
        );
      }
    },
    [l10n, alertSuccessAndGoHome, alertBar, account]
  );

  return (
    <Localized id="pw-create-header" attrs={{ title: true }}>
      <FlowContainer title="Create password">
        <FormPassword
          {...{
            formState,
            errors,
            trigger,
            register,
            getValues,
            newPasswordErrorText,
            setNewPasswordErrorText,
          }}
          onFocusMetricsEvent="create-password.engage"
          onSubmit={handleSubmit(onFormSubmit)}
          primaryEmail={account.primaryEmail.email}
          loading={account.loading}
        />
      </FlowContainer>
    </Localized>
  );
};

export default PageCreatePassword;
