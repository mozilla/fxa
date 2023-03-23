/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { NavigateFn, RouteComponentProps, useNavigate } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
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
import { LinkStatus } from '../../../lib/types';
import {
  useNotifier,
  useBroker,
  useAccount,
  useRelier,
  useUrlQueryDataStore,
} from '../../../models/hooks';
import {
  AccountRecoveryKeyInfo,
  VerificationInfo,
  useLocationStateData,
} from '../../../models';

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
  const broker = useBroker();
  const account = useAccount();
  const relier = useRelier();

  let navigate = useNavigate();
  navigate = overrides?.navigate || navigate;

  let urlQueryData = useUrlQueryDataStore();
  urlQueryData = overrides?.urlQueryData || urlQueryData;

  let locationData = useLocationStateData();
  locationData = overrides?.locationData || locationData;

  const verificationInfo = new VerificationInfo(urlQueryData);
  const accountRecoveryKeyInfo = new AccountRecoveryKeyInfo(locationData);
  const state = getInitialState();

  const [bannerState, setBannerState] = useState<BannerState>(BannerState.None);
  const [linkStatus, setLinkStatus] = useState<LinkStatus>(state.linkStatus);
  const [passwordMatchErrorText, setPasswordMatchErrorText] =
    useState<string>('');
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
      navigate(`/complete_reset_password?${urlQueryData.toSearchQuery()}`);
    }
  }, [state, navigate, urlQueryData]);

  if (linkStatus === 'damaged') {
    return <ResetPasswordLinkDamaged />;
  }

  if (linkStatus === 'expired') {
    return <LinkExpiredResetPassword {...{ viewName }} />;
  }

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
            passwordMatchErrorText,
            setPasswordMatchErrorText,
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
      await account.resetPasswordWithRecoveryKey(options);

      // FOLLOW-UP: Functionality not yet available.
      await account.setLastLogin(Date.now());

      // FOLLOW-UP: Functionality not yet available.
      notifier.onAccountSignIn(account);

      relier.resetPasswordConfirm = true;
      logViewEvent(viewName, 'verification.success');

      // FOLLOW-UP: Functionality not yet available.
      await broker.invokeBrokerMethod('afterCompleteResetPassword', account);

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

  function navigateAway() {
    setUserPreference('account-recovery', account.recoveryKey);
    logViewEvent(viewName, 'recovery-key-consume.success');

    const queryString = urlQueryData.toSearchQuery();
    navigate(`/reset_password_with_recovery_key_verified?${queryString}`);
  }

  function alertValidationError(err: ModelValidationErrors) {
    setBannerState(BannerState.UnexpectedError);
    console.error(
      `Invalid keys detected: ${err.errors.map((x) => x.key).join(',')}`
    );
  }
};

export default AccountRecoveryResetPassword;
