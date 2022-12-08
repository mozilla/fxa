import React, { useCallback, useState } from 'react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { useForm } from 'react-hook-form';
import { HomePath } from '../../constants';
import { usePageViewEvent } from '../../lib/metrics';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../models/hooks';
import { useAccount, useAlertBar } from '../../models';
import WarningMessage from '../../components/WarningMessage';
import FormPassword from '../../components/Settings/FormPassword';
import LinkRememberPassword from '../../components/LinkRememberPassword';

export type CompleteResetPasswordProps = {
  email?: string;
  forceEmail?: string;
  isLinkExpired?: boolean;
  isLinkDamaged?: boolean;
  showSyncWarning?: boolean;
  showAccountRecoveryInfo?: boolean;
};

type FormData = {
  newPassword: string;
  confirmPassword: string;
};

const CompleteResetPassword = ({
  email,
  forceEmail,
  isLinkExpired,
  isLinkDamaged,
  showSyncWarning,
  showAccountRecoveryInfo,
}: CompleteResetPasswordProps & RouteComponentProps) => {
  usePageViewEvent('complete-reset-password', {
    entrypoint_variation: 'react',
  });

  const resendLinkHandler = () => {
    //   TODO: add resend link action
  };

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
      {isLinkExpired && (
        <>
          <FtlMsg id="complete-reset-pw-link-expired-header">
            <h1 id="fxa-reset-link-expired-header" className="card-header">
              Reset password link expired
            </h1>
          </FtlMsg>

          <FtlMsg id="complete-reset-pw-link-expired-message">
            <p className="mt-4">
              The link you clicked to reset your password is expired.
            </p>
          </FtlMsg>
          <FtlMsg id="complete-reset-pw-resend-link">
            <button
              onClick={resendLinkHandler}
              className="cta-primary cta-base-p mt-4"
            >
              Receive new link
            </button>
          </FtlMsg>
        </>
      )}
      {isLinkDamaged && (
        <>
          <FtlMsg id="complete-reset-pw-link-damaged-header">
            <h1 id="fxa-reset-link-damaged-header" className="card-header">
              Reset password link damaged
            </h1>
          </FtlMsg>

          <FtlMsg id="complete-reset-pw-link-damaged-message">
            <p className="mt-4">
              The link you clicked was missing characters, and may have been
              broken by your email client. Copy the address carefully, and try
              again.
            </p>
          </FtlMsg>
        </>
      )}

      {/* With valid password reset link */}
      {!isLinkExpired && !isLinkDamaged && (
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
              <p className="mb-5 mt-4">
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
