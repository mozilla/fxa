/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import {
  NavigateFn,
  RouteComponentProps,
  useLocation,
  useNavigate,
} from '@reach/router';
import { FtlMsg, hardNavigateToContentServer } from 'fxa-react/lib/utils';
import { useForm } from 'react-hook-form';

import AppLayout from '../../../components/AppLayout';
import Banner, { BannerType } from '../../../components/Banner';
import CardHeader from '../../../components/CardHeader';
import FormPasswordWithBalloons from '../../../components/FormPasswordWithBalloons';
import { ResetPasswordLinkDamaged } from '../../../components/LinkDamaged';
import LinkRememberPassword from '../../../components/LinkRememberPassword';
import { LinkExpiredResetPassword } from '../../../components/LinkExpiredResetPassword';
import { REACT_ENTRYPOINT } from '../../../constants';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import {
  ModelValidationErrors,
  GenericData,
  UrlQueryData,
} from '../../../lib/model-data';
import {
  logErrorEvent,
  logViewEvent,
  setUserPreference,
  usePageViewEvent,
} from '../../../lib/metrics';
import { useNotifier, useAccount } from '../../../models/hooks';
import { LinkStatus } from '../../../lib/types';
import {
  CreateAccountRecoveryKeyInfo,
  CreateRelier,
  CreateVerificationInfo,
  CreateIntegration,
  IntegrationType,
} from '../../../models';
import { notifyFirefoxOfLogin } from '../../../lib/channels/helpers';
import { isOriginalTab } from '../../../lib/storage-utils';

// This page is based on complete_reset_password but has been separated to align with the routes.

// Users should only see this page if they initiated account recovery with a valid account recovery key
// Account recovery properties must be set to recover the account using the recovery key
// (recoveryKeyId, accountResetToken, kb)

// If lostRecoveryKey is set, redirect to /complete_reset_password

export const viewName = 'account-recovery-reset-password';

export type AccountRecoveryResetPasswordProps = {
  overrides?: {
    navigate?: NavigateFn;
    locationData?: GenericData;
    urlQueryData?: UrlQueryData;
  };
} & RouteComponentProps;

type FormData = {
  newPassword: string;
  confirmPassword: string;
};

enum BannerState {
  None,
  UnexpectedError,
  PasswordResetSuccess,
  Redirecting,
  PasswordResendError,
  ValidationError,
}

const AccountRecoveryResetPassword = ({
  overrides,
}: AccountRecoveryResetPasswordProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const notifier = useNotifier();
  const account = useAccount();
  const navigate = useNavigate();
  const location = useLocation();

  const integration = CreateIntegration();
  const relier = CreateRelier();
  const verificationInfo = CreateVerificationInfo();
  const accountRecoveryKeyInfo = CreateAccountRecoveryKeyInfo();

  const state = getInitialState();

  const [bannerState, setBannerState] = useState<BannerState>(BannerState.None);
  const [linkStatus, setLinkStatus] = useState<LinkStatus>(state.linkStatus);
  const { handleSubmit, register, getValues, errors, formState, trigger } =
    useForm<FormData>({
      mode: 'onTouched',
      criteriaMode: 'all',
      defaultValues: {
        newPassword: '',
        confirmPassword: '',
      },
    });

  useEffect(() => {
    if (state.validationError) {
      alertValidationError(state.validationError);
    } else if (!state.supportsRecovery) {
      setBannerState(BannerState.Redirecting);
      navigate(`/complete_reset_password?${location.search}`);
    }
  }, [
    state.validationError,
    state.supportsRecovery,
    navigate,
    location.search,
  ]);

  if (linkStatus === 'damaged') {
    return <ResetPasswordLinkDamaged />;
  }

  if (linkStatus === 'expired') {
    return <LinkExpiredResetPassword email={state.email} {...{ viewName }} />;
  }

  // TODO: implement persistVerificationData,
  // _finishPasswordResetDifferentBrowser + finishPasswordResetSameBrowser
  // + check afterResetPasswordConfirmationPoll (maybe this was done with `useInterval`?)

  return (
    <AppLayout>
      <CardHeader
        headingText="Create new password"
        headingTextFtlId="create-new-password-header"
      />
      {BannerState.Redirecting === bannerState && (
        <Banner type={BannerType.info}>
          <FtlMsg id="account-recovery-reset-password-redirecting">
            <p>Redirecting</p>
          </FtlMsg>
        </Banner>
      )}
      {BannerState.UnexpectedError === bannerState && (
        <Banner type={BannerType.error}>
          <FtlMsg id="account-recovery-reset-password-unexpected-error">
            <p>Unexpected error encountered</p>
          </FtlMsg>
        </Banner>
      )}

      {BannerState.PasswordResetSuccess === bannerState && (
        <Banner type={BannerType.success}>
          <FtlMsg id="account-recovery-reset-password-success-alert">
            <p>Password set</p>
          </FtlMsg>
        </Banner>
      )}

      <FtlMsg id="account-restored-success-message">
        <p className="text-sm mb-4">
          You have successfully restored your account using your account
          recovery key. Create a new password to secure your data, and store it
          in a safe location.
        </p>
      </FtlMsg>

      {/* Hidden email field is to allow Fx password manager
        to correctly save the updated password. Without it,
        the password manager tries to save the old password
        as the username. */}
      <input type="email" value={state.email} className="hidden" readOnly />
      <section className="text-start mt-4">
        <FormPasswordWithBalloons
          {...{
            formState,
            errors,
            trigger,
            register,
            getValues,
          }}
          passwordFormType="reset"
          onSubmit={handleSubmit(
            (data: FormData) => {
              onSubmit(data);
            },
            (err) => {
              console.error(err);
            }
          )}
          email={state.email}
          loading={false}
          onFocusMetricsEvent={`${viewName}.engage`}
        />
      </section>

      <LinkRememberPassword {...state} />
    </AppLayout>
  );

  /**
   * Determines starting state for component
   */
  function getInitialState() {
    let email = '';
    let linkStatus: LinkStatus = LinkStatus.valid;
    let forceAuth = false;
    let supportsRecovery = true;
    let validationError: ModelValidationErrors | null = null;

    try {
      email = verificationInfo.email || '';
      forceAuth = !!verificationInfo.forceAuth;

      if (!verificationInfo.isValid()) {
        supportsRecovery = false;
        linkStatus = LinkStatus.damaged;
      } else if (!accountRecoveryKeyInfo.isValid()) {
        supportsRecovery = false;
      } else if (verificationInfo.lostRecoveryKey === true) {
        supportsRecovery = false;
      }
    } catch (err) {
      if (err instanceof ModelValidationErrors) {
        validationError = err;
        linkStatus = LinkStatus.damaged;
      }
    }

    return {
      email,
      linkStatus,
      forceAuth,
      supportsRecovery,
      validationError,
    };
  }

  async function onSubmit(data: FormData) {
    const password = data.newPassword;

    try {
      const options = {
        password,
        accountResetToken: accountRecoveryKeyInfo.accountResetToken,
        kB: accountRecoveryKeyInfo.kB,
        recoveryKeyId: accountRecoveryKeyInfo.recoveryKeyId,
        emailToHashWith:
          verificationInfo.emailToHashWith || verificationInfo.email,
      };

      const accountResetData = await account.resetPasswordWithRecoveryKey(
        options
      );
      // must come after completeResetPassword since that receives the sessionToken
      // required for this check
      const sessionIsVerified = await account.isSessionVerifiedAuthClient();

      // FOLLOW-UP: Functionality not yet available. FXA-7045
      await account.setLastLogin(Date.now());

      // FOLLOW-UP: Functionality not yet available. FXA-7045
      notifier.onAccountSignIn(account);

      relier.resetPasswordConfirm = true;
      logViewEvent(viewName, 'verification.success');

      switch (integration.type) {
        // NOTE: SyncBasic check is temporary until we implement codes
        // See https://docs.google.com/document/d/1K4AD69QgfOCZwFLp7rUcMOkOTslbLCh7jjSdR9zpAkk/edit#heading=h.kkt4eylho93t
        case IntegrationType.SyncDesktop:
        case IntegrationType.SyncBasic:
          notifyFirefoxOfLogin(
            {
              authAt: accountResetData.authAt,
              email: verificationInfo.email,
              keyFetchToken: accountResetData.keyFetchToken,
              sessionToken: accountResetData.sessionToken,
              uid: accountResetData.uid,
              unwrapBKey: accountResetData.unwrapBKey,
              verified: accountResetData.verified,
            },
            sessionIsVerified
          );
          break;
        case IntegrationType.OAuth:
          if (
            sessionIsVerified &&
            // a user can only redirect back to the relier from the original tab
            // to avoid two tabs redirecting.
            isOriginalTab()
          ) {
            // TODO: this.finishOAuthSignInFlow(account)) in FXA-6518 and possibly
            // remove the !OAuth check from the React experiment in router.js
            return;
          }
          break;
        case IntegrationType.Web:
          // no-op, don't run default
          break;
        default:
        // TODO: run unpersistVerificationData when reliers are combined
      }

      alertSuccess();
      navigateAway();
    } catch (err) {
      if (AuthUiErrors['INVALID_TOKEN'].errno === err.errno) {
        logErrorEvent({ viewName, ...err });
        setLinkStatus(LinkStatus.expired);
      } else {
        // Validation errors indicate a bad state in either the url query or
        // maybe storage. In these cases show an alert bar and let the error
        // keep bubbling up.
        if (err instanceof ModelValidationErrors) {
          alertValidationError(err);
        } else {
          logErrorEvent(err);
          setBannerState(BannerState.UnexpectedError);
        }
        throw err;
      }
    }
  }

  function alertSuccess() {
    setBannerState(BannerState.PasswordResetSuccess);
  }

  async function navigateAway() {
    // TODO / refactor: the initial account result with useAccount() does not
    // contain account data due to no session token. Users receive the session
    // token on PW reset, so we can query here for it.
    const hasTotp = await account.hasTotpAuthClient();

    setUserPreference('account-recovery', false);
    logViewEvent(viewName, 'recovery-key-consume.success');

    if (hasTotp) {
      hardNavigateToContentServer(`/signin_totp_code${location.search}`);
    } else {
      navigate(`/reset_password_with_recovery_key_verified${location.search}`);
    }
  }

  function alertValidationError(err: ModelValidationErrors) {
    setBannerState(BannerState.UnexpectedError);
  }
};

export default AccountRecoveryResetPassword;
