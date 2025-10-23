/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Localized } from '@fluent/react';
import { RouteComponentProps } from '@reach/router';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { SETTINGS_PATH } from '../../../constants';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import {
  getErrorFtlId,
  getLocalizedErrorMessage,
} from '../../../lib/error-utils';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import {
  logViewEvent,
  settingsViewName,
  usePageViewEvent,
} from '../../../lib/metrics';
import { MfaReason } from '../../../lib/types';
import { useAccount, useAlertBar, useFtlMsgResolver } from '../../../models';
import FormPassword from '../../FormPassword';
import FlowContainer from '../FlowContainer';
import { MfaGuard } from '../MfaGuard';
import VerifiedSessionGuard from '../VerifiedSessionGuard';

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
  const account = useAccount();
  const alertBar = useAlertBar();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();

  const [currentPasswordErrorText, setCurrentPasswordErrorText] =
    useState<string>();
  const [newPasswordErrorText, setNewPasswordErrorText] = useState<string>();

  const goHome = useCallback(
    () =>
      navigateWithQuery(SETTINGS_PATH + '#password', {
        replace: true,
      }),
    [navigateWithQuery]
  );

  const alertSuccessAndGoHome = useCallback(() => {
    alertBar.success(
      ftlMsgResolver.getMsg('pw-change-success-alert-2', 'Password updated')
    );
    goHome();
  }, [alertBar, ftlMsgResolver, goHome]);

  const onFormSubmit = useCallback(
    async ({ oldPassword, newPassword }: FormData) => {
      if (oldPassword === newPassword) {
        const localizedError = ftlMsgResolver.getMsg(
          getErrorFtlId(AuthUiErrors.PASSWORDS_MUST_BE_DIFFERENT),
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
        const localizedError = getLocalizedErrorMessage(ftlMsgResolver, e);
        if (e.errno === AuthUiErrors.INCORRECT_PASSWORD.errno) {
          setCurrentPasswordErrorText(localizedError);
          setValue('oldPassword', '');
        } else {
          alertBar.error(localizedError);
        }
      }
    },
    [
      account,
      alertBar,
      alertSuccessAndGoHome,
      ftlMsgResolver,
      setCurrentPasswordErrorText,
      setNewPasswordErrorText,
      setValue,
    ]
  );

  return (
    <Localized id="pw-change-header" attrs={{ title: true }}>
      <FlowContainer title="Change password">
        <VerifiedSessionGuard onDismiss={goHome} onError={goHome} />
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

const MfaGuardedPageChangePassword = (_: RouteComponentProps) => {
  return (
    <MfaGuard requiredScope="password" reason={MfaReason.changePassword}>
      <PageChangePassword />
    </MfaGuard>
  );
};

export default MfaGuardedPageChangePassword;
