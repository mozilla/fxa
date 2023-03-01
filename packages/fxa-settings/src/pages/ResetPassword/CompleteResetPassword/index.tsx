/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState, useEffect } from 'react';
import {
  Link,
  RouteComponentProps,
  useLocation,
  useNavigate,
} from '@reach/router';
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
import {
  RequiredParamsCompleteResetPassword,
  useCompleteResetPasswordLinkStatus,
} from '../../../lib/hooks/useLinkStatus';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { LinkStatus } from '../../../lib/types';

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

type SubmitData = {
  newPassword: string;
} & RequiredParamsCompleteResetPassword;

type LocationState = { lostRecoveryKey: boolean };

const CompleteResetPassword = (_: RouteComponentProps) => {
  logPageViewEvent(viewName, REACT_ENTRYPOINT);

  const [passwordMatchErrorText, setPasswordMatchErrorText] =
    useState<string>('');
  const [hasRecoveryKeyError, setHasRecoveryKeyError] = useState(false);
  /* Show a loading spinner until all checks complete. Without this, users with a
   * recovery key set or with an expired or damaged link will experience some jank due
   * to an immediate redirect or rerender of this page. */
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(true);
  const navigate = useNavigate();
  const account = useAccount();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: LocationState;
  };

  const { linkStatus, setLinkStatus, requiredParams } =
    useCompleteResetPasswordLinkStatus();

  const [errorCompletePwdReset, setErrorCompletePwdReset] =
    useState<boolean>(false);

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
        setHasRecoveryKeyError(true);
      }
    };

    if (requiredParams && !location.state?.lostRecoveryKey) {
      checkForRecoveryKeyAndNavigate(requiredParams.email);
    }

    setShowLoadingSpinner(false);
  }, [
    setLinkStatus,
    account,
    navigate,
    location.search,
    requiredParams,
    location.state?.lostRecoveryKey,
    linkStatus,
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

    if (requiredParams) {
      checkPasswordForgotToken(requiredParams.token);
    }

    setShowLoadingSpinner(false);
  }, [requiredParams, account, setLinkStatus]);

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
    async ({ newPassword, token, code, email }: SubmitData) => {
      try {
        // TODO: do we no longer need emailToHashWith?
        await account.completeResetPassword(token, code, email, newPassword);
        alertSuccessAndNavigate();
      } catch (e) {
        setErrorCompletePwdReset(true);
      }
    },
    [account, alertSuccessAndNavigate]
  );

  if (linkStatus === LinkStatus.damaged || requiredParams === null) {
    return <LinkDamaged linkType="reset-password" />;
  }

  if (linkStatus === LinkStatus.expired) {
    return <LinkExpired linkType="reset-password" />;
  }

  if (showLoadingSpinner) {
    return (
      <LoadingSpinner className="bg-grey-20 flex items-center flex-col justify-center h-screen select-none" />
    );
  }

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

      <>
        {hasRecoveryKeyError && renderRecoveryKeyErrorBanner()}

        <CardHeader
          headingText="Create new password"
          headingTextFtlId="complete-reset-pw-header"
        />

        <WarningMessage
          warningMessageFtlId="complete-reset-password-warning-message-2"
          warningType="Remember:"
        >
          When you reset your password, you reset your account. You may lose
          some of your personal information (including history, bookmarks, and
          passwords). That’s because we encrypt your data with your password to
          protect your privacy. You’ll still keep any subscriptions you may have
          and Pocket data will not be affected.
        </WarningMessage>

        {/* Hidden email field is to allow Fx password manager
           to correctly save the updated password. Without it,
           the password manager tries to save the old password
           as the username. */}
        <input
          type="email"
          value={requiredParams.email}
          className="hidden"
          readOnly
        />
        <section className="text-start mt-4">
          <FormPasswordWithBalloons
            {...{
              formState,
              errors,
              trigger,
              register,
              getValues,
              passwordMatchErrorText,
              setPasswordMatchErrorText,
            }}
            email={requiredParams.email}
            passwordFormType="reset"
            onSubmit={handleSubmit(({ newPassword }) =>
              onSubmit({
                newPassword,
                token: requiredParams.token,
                code: requiredParams.code,
                email: requiredParams.email,
                // TODO: do we no longer need this?
                emailToHashWith: requiredParams.emailToHashWith,
              })
            )}
            loading={false}
            onFocusMetricsEvent={`${viewName}.engage`}
          />
        </section>
        <LinkRememberPassword email={requiredParams.email} />
      </>
    </AppLayout>
  );
};

export default CompleteResetPassword;
