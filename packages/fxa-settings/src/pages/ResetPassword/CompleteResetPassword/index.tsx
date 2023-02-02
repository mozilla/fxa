/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState } from 'react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { useForm } from 'react-hook-form';
import { usePageViewEvent } from '../../../lib/metrics';
import { FtlMsg } from 'fxa-react/lib/utils';

import { useFtlMsgResolver } from '../../../models/hooks';
import { useAlertBar } from '../../../models';
import WarningMessage from '../../../components/WarningMessage';
import LinkRememberPassword from '../../../components/LinkRememberPassword';
import LinkExpired from '../../../components/LinkExpired';
import LinkDamaged from '../../../components/LinkDamaged';
import FormPasswordWithBalloons from '../../../components/FormPasswordWithBalloons';
import { REACT_ENTRYPOINT } from '../../../constants';

// The equivalent complete_reset_password mustache file included account_recovery_reset_password
// For React, we have opted to separate these into two pages to align with the routes.
//
// Users should only see the CompleteResetPassword page on /complete _reset_password if
//   - there is no account recovery key for their account
//   - there is an account recovery key for their account, but it was reported as lost
//
// If the user has an account recovery key (and it is not reported as lost),
// navigate to /account_recovery_confirm_key
//
// If account recovery was initiated with a key, redirect to account_recovery_reset_password

export const viewName = 'complete-reset-password';

export type CompleteResetPasswordProps = {
  email: string;
  forceAuth?: boolean;
  linkStatus: LinkStatus;
  // resetPasswordConfirm will be obtained from the relier
  // resetPasswordConfirm determines if sync warning is shown
  resetPasswordConfirm?: boolean;
};

type FormData = {
  newPassword: string;
  confirmPassword: string;
};

type LinkStatus = 'expired' | 'damaged' | 'valid';

const CompleteResetPassword = ({
  email,
  forceAuth = false,
  linkStatus,
  resetPasswordConfirm,
}: CompleteResetPasswordProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const [passwordMatchErrorText, setPasswordMatchErrorText] =
    useState<string>('');
  const alertBar = useAlertBar();
  const navigate = useNavigate();
  const ftlMsgResolver = useFtlMsgResolver();

  const { handleSubmit, register, getValues, errors, formState, trigger } =
    useForm<FormData>({
      mode: 'onTouched',
      criteriaMode: 'all',
      defaultValues: {
        newPassword: '',
        confirmPassword: '',
      },
    });

  const alertSuccessAndNavigate = useCallback(() => {
    const successCompletePwdReset = ftlMsgResolver.getMsg(
      'complete-reset-password-success-alert',
      'Password set'
    );
    alertBar.success(successCompletePwdReset);
    navigate('/reset_password_verified', { replace: true });
  }, [alertBar, ftlMsgResolver, navigate]);

  const onSubmit = useCallback(
    async ({ newPassword }: FormData) => {
      try {
        // TODO: completeAccountPasswordReset
        // logViewEvent('verification.success');
        alertSuccessAndNavigate();
      } catch (e) {
        // if token expired, re-render and show LinkExpired
        // TODO metrics event for error
        const errorCompletePwdReset = ftlMsgResolver.getMsg(
          'complete-reset-password-error-alert',
          'Sorry, there was a problem setting your password'
        );
        alertBar.error(errorCompletePwdReset);
      }
    },
    [ftlMsgResolver, alertSuccessAndNavigate, alertBar]
  );

  return (
    <>
      {/* With valid password reset link */}
      {linkStatus === 'valid' && (
        <>
          <FtlMsg id="complete-reset-pw-header">
            <h1 id="fxa-reset-link-damaged-header" className="card-header">
              Create new password
            </h1>
          </FtlMsg>

          {/* SyncWarning is only shown if resetPasswordConfirm === true */}
          {resetPasswordConfirm && (
            <WarningMessage
              warningMessageFtlId="complete-reset-password-warning-message-2"
              warningType="Remember:"
            >
              When you reset your password, you reset your account. You may lose
              some of your personal information (including history, bookmarks,
              and passwords). That’s because we encrypt your data with your
              password to protect your privacy. You’ll still keep any
              subscriptions you may have and Pocket data will not be affected.
            </WarningMessage>
          )}

          {/* Hidden email field is to allow Fx password manager
           to correctly save the updated password. Without it,
           the password manager tries to save the old password
           as the username. */}
          <input type="email" value={email} className="hidden" readOnly />
          <section className="text-start mt-4">
            <FormPasswordWithBalloons
              {...{
                email,
                formState,
                errors,
                trigger,
                register,
                getValues,
                passwordMatchErrorText,
                setPasswordMatchErrorText,
              }}
              passwordFormType="reset"
              onSubmit={handleSubmit(onSubmit)}
              loading={false}
              onFocusMetricsEvent={`${viewName}.engage`}
            />
          </section>
          {/* TODO: Verify if the "Remember password?" should always direct to /signin (current state) */}
          <LinkRememberPassword {...{ email, forceAuth }} />
        </>
      )}
      {linkStatus === 'expired' && <LinkExpired linkType="reset-password" />}
      {linkStatus === 'damaged' && <LinkDamaged linkType="reset-password" />}
    </>
  );
};

export default CompleteResetPassword;
