/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { NavigateFn, RouteComponentProps, useNavigate } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import AppLayout from '../../../components/AppLayout';
import CardHeader from '../../../components/CardHeader';
import FormPasswordWithBalloons from '../../../components/FormPasswordWithBalloons';
import LinkDamaged from '../../../components/LinkDamaged';
import LinkExpired from '../../../components/LinkExpired';
import LinkRememberPassword from '../../../components/LinkRememberPassword';
import AlertBar from '../../../components/Settings/AlertBar';
import { REACT_ENTRYPOINT } from '../../../constants';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import {
  ContextValidationErrors,
  GenericContext,
  UrlSearchContext,
} from '../../../lib/context';
import {
  logErrorEvent,
  logViewEvent,
  setUserPreference,
  usePageViewEvent,
} from '../../../lib/metrics';
import {
  useAlertBar,
  useFtlMsgResolver,
  useNotifier,
  useBroker,
  useRelier,
  useUrlSearchContext,
} from '../../../models/hooks';
import { LinkStatus } from '../../../lib/types';
import {
  AccountRecoveryKeyInfo,
  VerificationInfo,
  useLocationStateContext as useLocationContext,
} from '../../../models';
import { PasswordResetAccount } from '../../../models/reset-password';

// This page is based on complete_reset_password but has been separated to align with the routes.

// Users should only see this page if they initiated account recovery with a valid account recovery key
// Account recovery properties must be set to recover the account using the recovery key
// (recoveryKeyId, accountResetToken, kb)

// If lostRecoveryKey is set, redirect to /complete_reset_password

export const viewName = 'account-recovery-reset-password';

export type AccountRecoveryResetPasswordProps = {
  //
  // Password reset now no longer depends directly on account. Rather
  // it depends on an interface that is more cohesive with it's concerns.
  //
  account: PasswordResetAccount;

  overrides?: {
    navigate?: NavigateFn;
    locationContext?: GenericContext;
    urlSearchContext?: UrlSearchContext;
  };
} & RouteComponentProps;

type FormData = {
  newPassword: string;
  confirmPassword: string;
};

const AccountRecoveryResetPassword = ({
  account,
  overrides,
}: AccountRecoveryResetPasswordProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  // Grab state from hooks
  const alertBar = useAlertBar();
  const notifier = useNotifier();
  const broker = useBroker();
  const ftlMsgResolver = useFtlMsgResolver();

  //
  // Switched to incoming prop
  //
  // const account = useAccount();
  //
  // Note: We could still use the hook pattern, but the hook would become
  // type specific. One issue with using hooks like this is that
  // the hooks module could turn into a nexus of type dependencies,
  // that is if we start relying on the hooks for lots  of different
  // of models. For this reason I don't think we should use hooks for
  // accessing AppContext. I also think that after level 2 in the component
  // hexarchy (or maybe level 3 or 4?? depending  on how you count)
  // all 'model' type things should be passed by prop.
  //
  // Cross cutting concerns like logging, l10n, etc, are good to use as
  // hooks at any level.
  //

  const relier = useRelier();
  let navigate = useNavigate();
  let urlSearchContext = useUrlSearchContext();
  let locationContext = useLocationContext();

  navigate = overrides?.navigate || navigate;
  urlSearchContext = overrides?.urlSearchContext || urlSearchContext;
  locationContext = overrides?.locationContext || locationContext;

  const verificationInfo = new VerificationInfo(urlSearchContext);
  const accountRecoveryKeyInfo = new AccountRecoveryKeyInfo(locationContext);

  // The alert bar can get stuck in a stale state.
  alertBar.hide();

  const state = getInitialState();
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

  // Make some presentation decisions based on initial state
  if (state.contextError) {
    alertInvalidContext(state.contextError);
  } else if (!state.supportsRecovery) {
    const msg = ftlMsgResolver.getMsg('redirecting', 'Redirecting');
    alertBar.info(msg);
    navigate(`/complete_reset_password?${urlSearchContext.toSearchQuery()}`);
  }

  return (
    <AppLayout>
      <AlertBar />
      {linkStatus === 'valid' && (
        <>
          <CardHeader
            headingText="Create new password"
            headingTextFtlId="create-new-password-header"
          />
          <FtlMsg id="account-restored-success-message">
            <p className="text-sm mb-4">
              You have successfully restored your account using your account
              recovery key. Create a new password to secure your data, and store
              it in a safe location.
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
        </>
      )}

      {linkStatus === 'damaged' && (
        <LinkDamaged {...{ linkType: 'reset-password' }} />
      )}

      {linkStatus === 'expired' && (
        <LinkExpired {...{ linkType: 'reset-password', resendLinkHandler }} />
      )}
    </AppLayout>
  );

  /**
   * Determines starting state for component
   */
  function getInitialState() {
    let email = '';
    let linkStatus: LinkStatus = 'valid';
    let forceAuth = false;
    let supportsRecovery = true;
    let contextError: ContextValidationErrors | null = null;

    try {
      email = verificationInfo.email || '';

      forceAuth = !!verificationInfo.forceAuth;

      if (!verificationInfo.isValid()) {
        supportsRecovery = false;
        linkStatus = 'damaged';
      } else if (!accountRecoveryKeyInfo.isValid()) {
        supportsRecovery = false;
      } else if (accountRecoveryKeyInfo.lostRecoveryKey === true) {
        supportsRecovery = false;
      }
    } catch (err) {
      if (err instanceof ContextValidationErrors) {
        contextError = err;
        linkStatus = 'damaged';
      }
    }

    return {
      email,
      linkStatus,
      forceAuth,
      supportsRecovery,
      contextError,
    };
  }

  async function onSubmit(data: FormData) {
    const password = data.newPassword;

    try {
      await account.resetPasswordWithRecoveryKey({
        password,
        ...verificationInfo,
        ...accountRecoveryKeyInfo,
      });

      // FOLLOW-UP: I don't see functionality in settings
      await account.setLastLogin(Date.now());

      // FOLLOW-UP: It seems like the account class will now refresh itself, so I don't think
      //            these are necessary anymore?
      // storageContext.set('currentAccountUid', account.uid);
      // await account.refresh('account');

      // FOLLOW-UP: No equivalent yet in settings
      notifier.onAccountSignIn(account);

      relier.resetPasswordConfirm = true;
      logViewEvent(viewName, 'verification.success');

      // FOLLOW-UP: Broker not yet implemented
      await broker.invokeBrokerMethod('afterCompleteResetPassword', account);
      alertSuccess();
      navigateAway();
    } catch (err) {
      if (AuthUiErrors['INVALID_TOKEN'].errno === err.errno) {
        // TODO: Is this needed? Had to add the a method to support this.
        // BEFORE: this.logError(err);
        logErrorEvent({ viewName, ...err });
        setLinkStatus('expired');
      } else {
        // Context validation errors indicate a bad state in either the url query or
        // maybe storage. In these cases show an alert bar and let the error keep bubbling
        // up.
        if (err instanceof ContextValidationErrors) {
          alertInvalidContext(err);
        } else {
          logErrorEvent(err);
          const msg = ftlMsgResolver.getMsg(
            'unexpected-error-encountered',
            'Unexpected Error Encountered'
          );
          alertBar.error(msg);
        }
        throw err;
      }
    }
  }

  async function resendLinkHandler() {
    logViewEvent(viewName, 'account-recovery-reset-password.resend');

    // FOLLOW-UP: The previous code would retry the resend several times. Is that really necessary...
    try {
      await account.resetPassword(state.email);
      const msg = ftlMsgResolver.getMsg(
        `email-resent`,
        'Email resent. Add accounts@firefox.com to your contacts to ensure a smooth delivery.'
      );
      alertBar.success(msg);
    } catch (err) {
      // FOLLOW-UP: Not sure if this is the right way to handle this. It didn't seem like the previous
      //       code would not translate the error?
      const msg = ftlMsgResolver.getMsg(
        'email-resend-error',
        'Sorry, there an issues resending!'
      );
      alertBar.error(msg, err);
    }
  }

  function alertSuccess() {
    const successCompletePwdReset = ftlMsgResolver.getMsg(
      `${viewName}-success-alert`,
      'Password set'
    );
    alertBar.success(successCompletePwdReset);
  }

  function navigateAway() {
    setUserPreference('account-recovery', account.recoveryKey);
    logViewEvent(viewName, 'recovery-key-consume.success');
    navigate(
      `/reset_password_with_recovery_key_verified?${urlSearchContext.toSearchQuery()}`
    );
  }

  function alertInvalidContext(err: ContextValidationErrors) {
    const keys = err.errors.map((x) => x.key).join(',');
    const msg = ftlMsgResolver.getMsg(
      'invalid-context',
      `Invalid context: ${keys}`,
      { keys }
    );
    alertBar.error(msg, err);
  }
};

export default AccountRecoveryResetPassword;
