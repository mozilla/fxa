/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState } from 'react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { useForm } from 'react-hook-form';
import { HomePath } from '../../../constants';
import { usePageViewEvent } from '../../../lib/metrics';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../../models/hooks';
import { useAccount, useAlertBar } from '../../../models';
import WarningMessage from '../../../components/WarningMessage';
import FormPassword from '../../../components/FormPassword';
import LinkRememberPassword from '../../../components/LinkRememberPassword';
import ResetPasswordLinkExpired from '../../../components/ResetPasswordLinkExpired';
import ResetPasswordLinkDamaged from '../../../components/ResetPasswordLinkDamaged';

export type CompleteResetPasswordProps = {
  email?: string;
  forceEmail?: string;
  linkStatus: LinkStatus;
  showSyncWarning?: boolean;
  showAccountRecoveryInfo?: boolean;
};

type FormData = {
  newPassword: string;
  confirmPassword: string;
};

type LinkStatus = 'expired' | 'damaged' | 'valid';

const CompleteResetPassword = ({
  email,
  forceEmail,
  linkStatus,
  showSyncWarning,
  showAccountRecoveryInfo,
}: CompleteResetPasswordProps & RouteComponentProps) => {
  usePageViewEvent('complete-reset-password', {
    entrypoint_variation: 'react',
  });

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
  const ftlMsgResolver = useFtlMsgResolver();

  const alertSuccessAndGoHome = useCallback(() => {
    const successCompletePwdReset = ftlMsgResolver.getMsg(
      'complete-reset-password-success-alert',
      'Password set'
    );
    alertBar.success(successCompletePwdReset);
    navigate(HomePath + '#password', { replace: true });
  }, [alertBar, ftlMsgResolver, navigate]);

  const onFormSubmit = useCallback(
    async ({ newPassword }: FormData) => {
      try {
        // TODO: add logic to set a new password
        alertSuccessAndGoHome();
      } catch (e) {
        // TODO metrics event for error
        const errorCompletePwdReset = ftlMsgResolver.getMsg(
          'complete-reset-password-error-alert',
          'Sorry, there was a problem setting your password'
        );
        alertBar.error(errorCompletePwdReset);
      }
    },
    [ftlMsgResolver, alertSuccessAndGoHome, alertBar]
  );

  return (
    <>
      {linkStatus === 'expired' && <ResetPasswordLinkExpired />}
      {linkStatus === 'damaged' && <ResetPasswordLinkDamaged />}

      {/* With valid password reset link */}
      {linkStatus === 'valid' && (
        <>
          <FtlMsg id="complete-reset-pw-header">
            <h1 id="fxa-reset-link-damaged-header" className="card-header">
              Create new password
            </h1>
          </FtlMsg>

          {showSyncWarning && (
            <WarningMessage
              warningMessageFtlId="complete-reset-password-warning-message"
              warningType="Remember:"
            >
              When you reset your password, you reset your account. You may lose
              some of your personal information (including history, bookmarks,
              and passwords). That’s because we encrypt your data with your
              password to protect your privacy. You’ll still keep any
              subscriptions you may have and Pocket data will not be affected.
            </WarningMessage>
          )}
          {showAccountRecoveryInfo && (
            <FtlMsg id="complete-reset-pw-account-recovery-info">
              <p className="mb-5 mt-4 text-sm">
                You have successfully restored your account using your account
                recovery key. Create a new password to secure your data, and
                store it in a safe location.
              </p>
            </FtlMsg>
          )}
          {/* Hidden email field is to allow Fx password manager
           to correctly save the updated password. Without it,
           the password manager tries to save the old password
           as the username. */}
          <input type="email" value={email} className="hidden" />
          <section className="text-start mt-4">
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
              onFocusMetricsEvent="complete-reset-password.engage"
              onSubmit={handleSubmit(onFormSubmit)}
              primaryEmail={account.primaryEmail.email}
              loading={account.loading}
            />
          </section>
          {!forceEmail && <LinkRememberPassword {...{ email }} />}
          {forceEmail && <LinkRememberPassword {...{ forceEmail }} />}
        </>
      )}
    </>
  );
};

export default CompleteResetPassword;
