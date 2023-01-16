/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from '@reach/router';
import { logViewEvent, usePageViewEvent } from '../../../lib/metrics';
import { useAccount, useAlertBar } from '../../../models';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../../models/hooks';

import { InputText } from '../../../components/InputText';
import LinkRememberPassword from '../../../components/LinkRememberPassword';
import ResetPasswordLinkExpired from '../../../components/ResetPasswordLinkExpired';
import ResetPasswordLinkDamaged from '../../../components/ResetPasswordLinkDamaged';
// --canGoBack-- determines if the user can navigate back to an fxa entrypoint

export type AccountRecoveryResetPasswordProps = {
  canGoBack?: boolean;
  linkStatus: LinkStatus;
};

type FormData = {
  currentPassword: string;
  newPassword: string;
};

type LinkStatus = 'expired' | 'damaged' | 'valid';

const AccountRecoveryResetPassword = ({
  canGoBack,
  linkStatus,
}: AccountRecoveryResetPasswordProps & RouteComponentProps) => {
  usePageViewEvent('account-recovery-reset-password', {
    entrypoint_variation: 'react',
  });

  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [currentPasswordErrorText, setCurrentPasswordErrorText] =
    useState<string>('');
  const [newPasswordErrorText, setNewPasswordErrorText] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const alertBar = useAlertBar();
  const account = useAccount();
  const navigate = useNavigate();
  const onFocusMetricsEvent = 'account-recovery-reset-password.engage';
  const ftlMsgResolver = useFtlMsgResolver();

  const { handleSubmit } = useForm<FormData>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  });

  const onFocus = () => {
    if (!isFocused && onFocusMetricsEvent) {
      logViewEvent('flow', onFocusMetricsEvent, {
        entrypoint_variation: 'react',
      });
      setIsFocused(true);
    }
  };

  const navigateToHome = useCallback(() => {
    navigate('/settings', { replace: true });
  }, [navigate]);

  // TO-DO:
  // * Set tooltip error message reflecting password requirements.
  // const setErrorMessage = (errorText: string) => {
  //   setEmailErrorText(errorText);
  // };
  // * Set up metrics for all events
  // - submitting the new password
  // - focusing the password inputs if desired
  // - remembering one's password
  // - asking for a new link.
  // * Hook up the functionality for sending a user a new verification link,
  // instead of this dummy function.
  const sendNewLinkEmail = () => {};

  const onSubmit = () => {
    try {
      account.changePassword(currentPassword, newPassword);
      navigateToHome();
    } catch (e) {
      const errorAccountRecoveryResetPassword = ftlMsgResolver.getMsg(
        'reset-password-error-general',
        'Sorry, there was a problem resetting your password'
      );
      alertBar.error(errorAccountRecoveryResetPassword);
    }
  };

  const newPasswordLabel = ftlMsgResolver.getMsg(
    'new-password-label',
    'New password'
  );
  const currentPasswordLabel = ftlMsgResolver.getMsg(
    'current-password-label',
    'Current password'
  );

  return (
    <>
      {linkStatus === 'valid' && (
        <>
          <div className="mb-4">
            <h1 className="card-header">
              <FtlMsg id="create-new-password-header">
                Create new password
              </FtlMsg>
            </h1>
          </div>
          <p className="text-sm mb-6">
            <FtlMsg id="account-restored-success-message">
              You have successfully restored your account using your account
              recovery key. Create a new password to secure your data, and store
              it in a safe location.
            </FtlMsg>
          </p>
          <form
            noValidate
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
            data-testid="account-recovery-reset-password-form"
          >
            <InputText
              type="password"
              label={newPasswordLabel}
              onChange={(e) => {
                setNewPassword(e.target.value);
                // clear error tooltip if user types in the field
                if (newPasswordErrorText) {
                  setNewPasswordErrorText('');
                }
              }}
              onFocusCb={onFocusMetricsEvent ? onFocus : undefined}
              autoFocus
              errorText={newPasswordErrorText}
              className="text-start"
              anchorStart
              autoComplete="off"
              spellCheck={false}
              prefixDataTestId="account-recovery-reset-password-new-password"
            />
            <InputText
              type="password"
              label={currentPasswordLabel}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                // clear error tooltip if user types in the field
                if (currentPasswordErrorText) {
                  setCurrentPasswordErrorText('');
                }
              }}
              onFocusCb={onFocusMetricsEvent ? onFocus : undefined}
              errorText={currentPasswordErrorText}
              className="text-start"
              anchorStart
              autoComplete="off"
              spellCheck={false}
              prefixDataTestId="account-recovery-reset-password-current-password"
            />

            <FtlMsg id="confirm-account-recovery-key-button">
              <button
                data-testid="confirm-account-recovery-key-button"
                type="submit"
                className="cta-primary cta-xl"
              >
                Reset password
              </button>
            </FtlMsg>
          </form>

          {canGoBack && <LinkRememberPassword />}
        </>
      )}
      {linkStatus === 'damaged' && <ResetPasswordLinkDamaged />}
      {linkStatus === 'expired' && <ResetPasswordLinkExpired />}
    </>
  );
};

export default AccountRecoveryResetPassword;
