/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from '@reach/router';
import { useForm } from 'react-hook-form';
import { logPageViewEvent } from '../../../lib/metrics';
import { useAccount } from '../../../models';
import WarningMessage from '../../../components/WarningMessage';
import LinkRememberPassword from '../../../components/LinkRememberPassword';
import FormPasswordWithBalloons from '../../../components/FormPasswordWithBalloons';
import { REACT_ENTRYPOINT } from '../../../constants';
import CardHeader from '../../../components/CardHeader';
import AppLayout from '../../../components/AppLayout';
import Banner, { BannerType } from '../../../components/Banner';
import { FtlMsg } from 'fxa-react/lib/utils';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { LinkStatus } from '../../../lib/types';
import { CompleteResetPasswordLink } from '../../../models/reset-password/verification';
import useNavigateWithoutRerender from '../../../lib/hooks/useNavigateWithoutRerender';

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

enum ErrorType {
  'none',
  'recovery-key',
  'complete-reset',
}

export const viewName = 'complete-reset-password';

type FormData = {
  newPassword: string;
  confirmPassword: string;
};

type SubmitData = {
  newPassword: string;
} & CompleteResetPasswordParams;

type LocationState = { lostRecoveryKey: boolean };

type CompleteResetPasswordParams = {
  email: string;
  emailToHashWith: string;
  code: string;
  token: string;
};

const CompleteResetPassword = ({
  params,
  setLinkStatus,
}: {
  params: CompleteResetPasswordLink;
  setLinkStatus: React.Dispatch<React.SetStateAction<LinkStatus>>;
}) => {
  logPageViewEvent(viewName, REACT_ENTRYPOINT);

  const [passwordMatchErrorText, setPasswordMatchErrorText] =
    useState<string>('');
  const [errorType, setErrorType] = useState(ErrorType.none);
  /* Show a loading spinner until all checks complete. Without this, users with a
   * recovery key set or with an expired or damaged link will experience some jank due
   * to an immediate redirect or rerender of this page. */
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(true);
  const navigate = useNavigate();
  const navigateWithoutRerender = useNavigateWithoutRerender();
  const account = useAccount();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: LocationState;
  };

  /* When the user clicks the confirm password reset link from their email, we check
   * to see if they have an account recovery key set. If they do, we navigate to the
   * `account_recovery_confirm_key` page. If they don't, they'll continue on with a
   * regular password reset. If users click the link leading back to this page from
   * `account_recovery_confirm_key`, assume the user has lost the key and pass along
   * a `lostRecoveryKey` flag so we don't perform the check and redirect again. */
  useEffect(() => {
    const checkForRecoveryKeyAndNavigate = async (email: string) => {
      try {
        if (await account.hasRecoveryKey(email)) {
          navigate(`/account_recovery_confirm_key${location.search}`, {
            replace: true,
          });
        }
      } catch (error) {
        setErrorType(ErrorType['recovery-key']);
      }
    };

    if (!location.state?.lostRecoveryKey) {
      checkForRecoveryKeyAndNavigate(params.email);
    }

    setShowLoadingSpinner(false);
  }, [
    account,
    navigate,
    location.search,
    location.state?.lostRecoveryKey,
    params.email,
  ]);

  useEffect(() => {
    const checkPasswordForgotToken = async (token: string) => {
      try {
        const isValid = await account.resetPasswordStatus(token);
        if (!isValid) {
          setLinkStatus(LinkStatus.expired);
        }
      } catch (e) {
        setLinkStatus(LinkStatus.damaged);
      }
    };

    checkPasswordForgotToken(params.token);

    setShowLoadingSpinner(false);
  }, [params.token, account, setLinkStatus]);

  const { handleSubmit, register, watch, errors, formState, trigger } =
    useForm<FormData>({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        newPassword: '',
        confirmPassword: '',
      },
    });

  const alertSuccessAndNavigate = useCallback(() => {
    setErrorType(ErrorType.none);
    navigateWithoutRerender('/reset_password_verified', { replace: true });
  }, [navigateWithoutRerender]);

  const onSubmit = useCallback(
    async ({
      newPassword,
      token,
      code,
      email,
      emailToHashWith,
    }: SubmitData) => {
      try {
        // The `emailToHashWith` option is returned by the auth-server to let the front-end
        // know what to hash the new password with. This is important in the scenario where a user
        // has changed their primary email address. In this case, they must still hash with the
        // account's original email because this will maintain backwards compatibility with
        // how account password hashing works previously.
        const emailToUse = emailToHashWith || email;
        await account.completeResetPassword(
          token,
          code,
          emailToUse,
          newPassword
        );
        alertSuccessAndNavigate();
      } catch (e) {
        setErrorType(ErrorType['complete-reset']);
      }
    },
    [account, alertSuccessAndNavigate]
  );

  if (showLoadingSpinner) {
    return (
      <LoadingSpinner className="bg-grey-20 flex items-center flex-col justify-center h-screen select-none" />
    );
  }

  const renderCompleteResetPasswordErrorBanner = () => {
    return (
      <Banner type={BannerType.error}>
        <FtlMsg id="complete-reset-password-error-alert">
          <p>Sorry, there was a problem setting your password</p>
        </FtlMsg>
      </Banner>
    );
  };

  const renderRecoveryKeyErrorBanner = () => {
    const hasRecoveryKeyErrorLink = (
      <Link
        to={`/account_recovery_confirm_key${location.search}`}
        className="link-white"
      >
        Reset your password with your account recovery key.
      </Link>
    );

    return (
      <Banner type={BannerType.error}>
        <FtlMsg
          id="complete-reset-password-recovery-key-error"
          elems={{
            hasRecoveryKeyErrorLink,
          }}
        >
          <p>
            Sorry, there was a problem checking if you have an account recovery
            key. {hasRecoveryKeyErrorLink}.
          </p>
        </FtlMsg>
      </Banner>
    );
  };

  return (
    <AppLayout>
      <CardHeader
        headingText="Create new password"
        headingTextFtlId="complete-reset-pw-header"
      />

      {errorType === ErrorType['recovery-key'] &&
        renderRecoveryKeyErrorBanner()}
      {errorType === ErrorType['complete-reset'] &&
        renderCompleteResetPasswordErrorBanner()}

      <WarningMessage
        warningMessageFtlId="complete-reset-password-warning-message-2"
        warningType="Remember:"
      >
        When you reset your password, you reset your account. You may lose some
        of your personal information (including history, bookmarks, and
        passwords). That’s because we encrypt your data with your password to
        protect your privacy. You’ll still keep any subscriptions you may have
        and Pocket data will not be affected.
      </WarningMessage>

      {/* Hidden email field is to allow Fx password manager
          to correctly save the updated password. Without it,
          the password manager tries to save the old password
          as the username. */}
      <input type="email" value={params.email} className="hidden" readOnly />
      <section className="text-start mt-4">
        <FormPasswordWithBalloons
          {...{
            formState,
            errors,
            trigger,
            register,
            passwordMatchErrorText,
            setPasswordMatchErrorText,
            watch,
          }}
          email={params.email}
          passwordFormType="reset"
          onSubmit={handleSubmit(({ newPassword }) =>
            onSubmit({
              newPassword,
              token: params.token,
              code: params.code,
              email: params.email,
              emailToHashWith: params.emailToHashWith,
            })
          )}
          onEngageMetricsEvent={`${viewName}.engage`}
        />
      </section>
      <LinkRememberPassword email={params.email} />
    </AppLayout>
  );
};

export default CompleteResetPassword;
