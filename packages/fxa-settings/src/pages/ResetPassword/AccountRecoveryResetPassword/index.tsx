/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useLocation, useNavigate } from '@reach/router';
import {
  FtlMsg,
  hardNavigate,
  hardNavigateToContentServer,
} from 'fxa-react/lib/utils';
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
  logErrorEvent,
  logViewEvent,
  setUserPreference,
  usePageViewEvent,
} from '../../../lib/metrics';
import { useAccount } from '../../../models/hooks';
import { LinkStatus } from '../../../lib/types';
import { IntegrationType, isOAuthIntegration } from '../../../models';
import { notifyFirefoxOfLogin } from '../../../lib/channels/helpers';
import {
  clearOAuthData,
  clearOriginalTab,
  isOriginalTab,
} from '../../../lib/storage-utils';
import {
  AccountRecoveryResetPasswordBannerState,
  AccountRecoveryResetPasswordFormData,
  AccountRecoveryResetPasswordLocationState,
  AccountRecoveryResetPasswordProps,
} from './interfaces';
import { CreateVerificationInfo } from '../../../models/verification';

// This page is based on complete_reset_password but has been separated to align with the routes.

// Users should only see this page if they initiated account recovery with a valid account recovery key
// Account recovery properties must be set to recover the account using the recovery key
// (recoveryKeyId, accountResetToken, kb)

export const viewName = 'account-recovery-reset-password';

const AccountRecoveryResetPassword = ({
  integration,
  finishOAuthFlowHandler,
}: AccountRecoveryResetPasswordProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const account = useAccount();
  const navigate = useNavigate();

  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: AccountRecoveryResetPasswordLocationState;
  };
  // TODO: This should be done in a container component
  const verificationInfo = CreateVerificationInfo();

  const [bannerState, setBannerState] =
    useState<AccountRecoveryResetPasswordBannerState>(
      AccountRecoveryResetPasswordBannerState.None
    );

  // TODO: This should be done in a container component
  const linkIsValid = !!(
    location.state.accountResetToken &&
    location.state.kB &&
    location.state.recoveryKeyId &&
    verificationInfo.email
  );

  const [linkStatus, setLinkStatus] = useState<LinkStatus>(
    linkIsValid ? LinkStatus.valid : LinkStatus.damaged
  );

  const { handleSubmit, register, getValues, errors, formState, trigger } =
    useForm<AccountRecoveryResetPasswordFormData>({
      mode: 'onTouched',
      criteriaMode: 'all',
      defaultValues: {
        newPassword: '',
        confirmPassword: '',
      },
    });

  if (linkStatus === 'damaged') {
    return <ResetPasswordLinkDamaged />;
  }

  if (linkStatus === 'expired') {
    if (isOAuthIntegration(integration)) {
      const service = integration.getService();
      const redirectUri = integration.getRedirectUri();
      return (
        <LinkExpiredResetPassword
          email={verificationInfo.email}
          {...{ viewName, service, redirectUri }}
        />
      );
    }

    return (
      <LinkExpiredResetPassword
        email={verificationInfo.email}
        {...{ viewName, integration }}
      />
    );
  }

  return (
    <AppLayout>
      <CardHeader
        headingText="Create new password"
        headingTextFtlId="create-new-password-header"
      />
      {AccountRecoveryResetPasswordBannerState.Redirecting === bannerState && (
        <Banner type={BannerType.info}>
          <FtlMsg id="account-recovery-reset-password-redirecting">
            <p>Redirecting</p>
          </FtlMsg>
        </Banner>
      )}
      {AccountRecoveryResetPasswordBannerState.UnexpectedError ===
        bannerState && (
        <Banner type={BannerType.error}>
          <FtlMsg id="account-recovery-reset-password-unexpected-error">
            <p>Unexpected error encountered</p>
          </FtlMsg>
        </Banner>
      )}

      {AccountRecoveryResetPasswordBannerState.PasswordResetSuccess ===
        bannerState && (
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
      <input
        type="email"
        value={verificationInfo.email}
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
          }}
          passwordFormType="reset"
          onSubmit={handleSubmit(
            (data: AccountRecoveryResetPasswordFormData) => {
              onSubmit(data);
            },
            (err) => {
              console.error(err);
            }
          )}
          email={verificationInfo.email}
          loading={false}
          onFocusMetricsEvent={`${viewName}.engage`}
        />
      </section>

      <LinkRememberPassword email={verificationInfo.email} />
    </AppLayout>
  );

  async function onSubmit(data: AccountRecoveryResetPasswordFormData) {
    const password = data.newPassword;
    const email = verificationInfo.email;

    try {
      const options = {
        password,
        accountResetToken: location.state.accountResetToken,
        kB: location.state.kB,
        recoveryKeyId: location.state.recoveryKeyId,
        emailToHashWith: verificationInfo.emailToHashWith || email,
      };

      const accountResetData = await account.resetPasswordWithRecoveryKey(
        options
      );
      // must come after completeResetPassword since that receives the sessionToken
      // required for this check
      const sessionIsVerified = await account.isSessionVerifiedAuthClient();

      // TODO: do we need this? Is integration data the right place for it if so?
      integration.data.resetPasswordConfirm = true;

      logViewEvent(viewName, 'verification.success');

      switch (integration.type) {
        // NOTE: SyncBasic check is temporary until we implement codes
        // See https://docs.google.com/document/d/1K4AD69QgfOCZwFLp7rUcMOkOTslbLCh7jjSdR9zpAkk/edit#heading=h.kkt4eylho93t
        case IntegrationType.SyncDesktop:
        case IntegrationType.SyncBasic:
          notifyFirefoxOfLogin({
            authAt: accountResetData.authAt,
            email,
            keyFetchToken: accountResetData.keyFetchToken,
            sessionToken: accountResetData.sessionToken,
            uid: accountResetData.uid,
            unwrapBKey: accountResetData.unwrapBKey,
            verified: accountResetData.verified,
          });
          break;
        case IntegrationType.OAuth:
          // TODO just use type guard instead of switch, FXA-8111
          if (sessionIsVerified && isOAuthIntegration(integration)) {
            const { redirect } = await finishOAuthFlowHandler(
              integration.data.uid || account.uid,
              accountResetData.sessionToken,
              accountResetData.keyFetchToken,
              accountResetData.unwrapBKey
            );

            // Clear session / local storage states
            clearOAuthData();

            // If the user is on a single tab throughout this process, just redirect them
            // back to the relying party. Otherwise, show them a success message
            if (isOriginalTab()) {
              clearOriginalTab();
              hardNavigate(redirect);
              return;
            }
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
        logErrorEvent(err);
        setBannerState(AccountRecoveryResetPasswordBannerState.UnexpectedError);
      }
    }
  }

  function alertSuccess() {
    setBannerState(
      AccountRecoveryResetPasswordBannerState.PasswordResetSuccess
    );
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
};

export default AccountRecoveryResetPassword;
