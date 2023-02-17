/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState, useEffect } from 'react';
import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import { useForm } from 'react-hook-form';
import { logPageViewEvent } from '../../../lib/metrics';

import { useAccount } from '../../../models/hooks';
import WarningMessage from '../../../components/WarningMessage';
import LinkRememberPassword from '../../../components/LinkRememberPassword';
import LinkExpired from '../../../components/LinkExpired';
import LinkDamaged from '../../../components/LinkDamaged';
import FormPasswordWithBalloons from '../../../components/FormPasswordWithBalloons';
import { REACT_ENTRYPOINT } from '../../../constants';
import CardHeader from '../../../components/CardHeader';
import AppLayout from '../../../components/AppLayout';
import Banner, { BannerType } from '../../../components/Banner';
import { FtlMsg } from 'fxa-react/lib/utils';

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

type FormData = {
  newPassword: string;
  confirmPassword: string;
};

type LinkStatus = 'expired' | 'damaged' | 'valid';

const CompleteResetPassword = (_: RouteComponentProps) => {
  logPageViewEvent(viewName, REACT_ENTRYPOINT);

  const [passwordMatchErrorText, setPasswordMatchErrorText] =
    useState<string>('');
  const navigate = useNavigate();
  const account = useAccount();
  const [linkStatus, setLinkStatus] = useState<LinkStatus>('valid');
  const [errorCompletePwdReset, setErrorCompletePwdReset] =
    useState<boolean>(false);

  // TODO: Pull this information from relier, in meantime we can get from query params
  const [resetPasswordConfirm] = useState<boolean>(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.href);
  const token = searchParams.get('token');
  const code = searchParams.get('code');
  const email = searchParams.get('email');
  const passwordHash = searchParams.get('emailToHashWith');

  useEffect(() => {
    if (!token || !code || !email || !passwordHash) {
      setLinkStatus('damaged');
    }
  }, [token, code, email, passwordHash]);

  useEffect(() => {
    const checkPasswordForgotToken = async (token: string) => {
      try {
        const isValid = await account.resetPasswordStatus(token);
        if (!isValid) {
          setLinkStatus('expired');
        }
      } catch (e) {
        setLinkStatus('damaged');
      }
    };

    checkPasswordForgotToken(token!);
  }, [token]);

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
    navigate('/reset_password_verified', { replace: true });
  }, [navigate]);

  const onSubmit = useCallback(
    async ({ newPassword }: FormData) => {
      try {
        await account.completeResetPassword(token!, code!, email!, newPassword);
        alertSuccessAndNavigate();
      } catch (e) {
        setErrorCompletePwdReset(true);
      }
    },
    [token, code, email]
  );

  return (
    <AppLayout>
      {errorCompletePwdReset && (
        <Banner
          type={BannerType.error}
          dismissible
          setIsVisible={setErrorCompletePwdReset}
        >
          <FtlMsg id="complete-reset-password-error-alert">
            <p>Sorry, there was a problem setting your password</p>
          </FtlMsg>
        </Banner>
      )}

      {/* With valid password reset link */}
      {linkStatus === 'valid' && (
        <>
          <CardHeader
            headingText="Create new password"
            headingTextFtlId="complete-reset-pw-header"
          />

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
          <input type="email" value={email!} className="hidden" readOnly />
          <section className="text-start mt-4">
            <FormPasswordWithBalloons
              {...{
                email: email!,
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
          <LinkRememberPassword {...{ email: email! }} />
        </>
      )}
      {linkStatus === 'expired' && <LinkExpired linkType="reset-password" />}
      {linkStatus === 'damaged' && <LinkDamaged linkType="reset-password" />}
    </AppLayout>
  );
};

export default CompleteResetPassword;
