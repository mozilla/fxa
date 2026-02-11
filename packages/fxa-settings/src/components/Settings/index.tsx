/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import * as Sentry from '@sentry/browser';
import SettingsLayout from './SettingsLayout';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import AppErrorDialog from 'fxa-react/components/AppErrorDialog';
import {
  useAccount,
  useAuthClient,
  useSession,
} from '../../models';
import { useAccountData, InvalidTokenError } from '../../lib/hooks/useAccountData';
import {
  Redirect,
  Router,
  RouteComponentProps,
  useLocation,
} from '@reach/router';
import PageSettings from './PageSettings';
import MfaGuardedPageChangePassword from './PageChangePassword';
import MfaPageCreatePassword from './PageCreatePassword';
import { MfaGuardPageSecondaryEmailAdd } from './PageSecondaryEmailAdd';
import { MfaGuardPageSecondaryEmailVerify } from './PageSecondaryEmailVerify';
import { PageDisplayName } from './PageDisplayName';
import { MfaGuardPage2faSetup } from './Page2faSetup';
import { MfaGuardPage2faChange } from './Page2faChange';
import { MfaGuardPage2faReplaceBackupCodes } from './Page2faReplaceBackupCodes';
import { MfaGuardPageRecoveryPhoneSetup } from './PageRecoveryPhoneSetup';
import { PageDeleteAccount } from './PageDeleteAccount';
import { ScrollToTop } from './ScrollToTop';
import { SETTINGS_PATH } from '../../constants';
import PageAvatar from './PageAvatar';
import PageRecentActivity from './PageRecentActivity';
import { MfaGuardPageRecoveryKeyCreate } from './PageRecoveryKeyCreate';
import { currentAccount, sessionToken } from '../../lib/cache';
import { hasAccount, setCurrentAccount } from '../../lib/storage-utils';
import GleanMetrics from '../../lib/glean';
import Head from 'fxa-react/components/Head';
import { PageMfaGuardRecoveryPhoneRemove } from './PageRecoveryPhoneRemove';
import { SettingsIntegration } from './interfaces';
import { useNavigateWithQuery } from '../../lib/hooks/useNavigateWithQuery';

import PageMfaGuardTestWithAuthClient from './PageMfaGuardTest';

export const Settings = ({
  integration,
}: { integration: SettingsIntegration } & RouteComponentProps) => {
  const session = useSession();
  const authClient = useAuthClient();
  const account = useAccount();
  const location = useLocation();
  const navigateWithQuery = useNavigateWithQuery();
  const [sessionVerified, setSessionVerified] = useState<boolean | undefined>();
  const [sessionVerificationMeetsAAL, setSessionVerificationMeetsAAL] =
    useState<boolean | undefined>();

  const { isLoading: loading, error } = useAccountData({ authClient });

  useEffect(() => {
    /**
     * Handle multi-tab account state synchronization.
     *
     * Account state is stored in localStorage and shared between all tabs.
     * When a user has account A signed in on tab 1, and account B signed in
     * on tab 2, localStorage reflects whichever account was last signed in.
     *
     * On window focus, we sync the current account in localStorage to match
     * the in-memory account state for this tab.
     *
     * See FXA-9875 for potential cleanup of this multi-tab state handling.
     */
    function handleWindowFocus() {
      const accountUidFromContext = (() => {
        try {
          return account.uid;
        } catch {}
        return undefined;
      })();

      if (accountUidFromContext === undefined) {
        console.warn('Could not access account.uid from context!');
        navigateWithQuery('/');
        return;
      }

      if (currentAccount()?.uid === accountUidFromContext) {
        return;
      }

      if (hasAccount(accountUidFromContext)) {
        setCurrentAccount(accountUidFromContext);
        return;
      }

      console.warn('Could not locate current account in local storage');
      navigateWithQuery('/');
    }
    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [account, navigateWithQuery, session]);

  const { enabled: gleanEnabled } = GleanMetrics.useGlean();

  useEffect(() => {
    gleanEnabled && GleanMetrics.pageLoad(location.pathname);
  }, [location.pathname, gleanEnabled]);

  useEffect(() => {
    (async () => {
      // Only run once
      if (
        sessionVerified !== undefined ||
        sessionVerificationMeetsAAL !== undefined
      ) {
        return;
      }
      const { details } = await authClient.sessionStatus(sessionToken()!);
      setSessionVerified(details.sessionVerified);
      setSessionVerificationMeetsAAL(
        details.sessionVerificationMeetsMinimumAAL
      );
    })();
  }, [authClient, sessionVerified, sessionVerificationMeetsAAL]);

  if (loading || sessionVerified === undefined) {
    return <LoadingSpinner fullScreen />;
  }

  // This error check includes a network error
  if (error) {
    // If the session token is invalid (destroyed/expired), redirect to signin
    if (error instanceof InvalidTokenError) {
      navigateWithQuery('/signin');
      return <LoadingSpinner fullScreen />;
    }
    Sentry.captureException(error, { tags: { source: 'settings' } });
    GleanMetrics.error.view({ event: { reason: error.message } });
    return <AppErrorDialog data-testid="error-dialog" />;
  }

  // If the account email isn't verified or the user is an unverified session state,
  // kick back to root to prompt for verification. This should only happen if the user
  // tries to access /settings directly without entering a confirmation code on
  // confirm_signup_code page or signin_token_code page.
  if (account.primaryEmail.verified === false || sessionVerified === false) {
    console.warn(
      'Account or email verification is require to access /settings!'
    );
    navigateWithQuery('/');
    return <LoadingSpinner fullScreen />;
  }

  // This happens when a multi-device user sets up 2FA on device A and tries
  // to access Settings on device B. If they haven't upgraded the assurance level
  // on device B's session token with TOTP, we require them to.
  if (sessionVerificationMeetsAAL === false) {
    console.warn('2FA must be entered to access /settings!');
    const storedAccount = currentAccount();
    navigateWithQuery('/signin_totp_code', {
      state: {
        email: storedAccount?.email,
        sessionToken: storedAccount?.sessionToken,
        uid: storedAccount?.uid,
        verified: storedAccount?.verified,
        isSessionAALUpgrade: true,
      },
    });
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SettingsLayout>
      <Head />
      <Router basepath={SETTINGS_PATH}>
        <ScrollToTop default>
          <PageSettings path="/" {...{ integration }} />
          <PageDisplayName path="/display_name" />
          <PageAvatar path="/avatar" />
          {/* MfaPageCreatePassword internally redirects to /change_password if password exists */}
          <MfaPageCreatePassword path="/create_password" />
          <MfaGuardPage2faSetup path="/two_step_authentication" />
          <MfaGuardPage2faChange path="/two_step_authentication/change" />
          <MfaGuardPage2faReplaceBackupCodes path="/two_step_authentication/replace_codes" />
          {account.hasPassword ? (
            <>
              <MfaGuardPageRecoveryKeyCreate path="/account_recovery" />
              <MfaGuardedPageChangePassword path="/change_password" />
            </>
          ) : (
            <>
              <Redirect
                from="/change_password"
                to="/settings/create_password"
                noThrow
              />
              <Redirect from="/account_recovery" to="/settings" noThrow />
            </>
          )}
          <MfaGuardPageSecondaryEmailAdd path="/emails" />
          <MfaGuardPageSecondaryEmailVerify path="/emails/verify" />
          <PageRecentActivity path="/recent_activity" />
          <PageDeleteAccount path="/delete_account" />
          <Redirect from="/clients" to="/settings#connected-services" noThrow />
          {/* NOTE: `/settings/avatar/change` is used to link directly to the avatar page within Sync preferences settings on Firefox browsers */}
          <Redirect from="/avatar/change" to="/settings/avatar/" noThrow />

          <MfaGuardPageRecoveryPhoneSetup path="/recovery_phone/setup" />
          <PageMfaGuardRecoveryPhoneRemove path="/recovery_phone/remove" />

          <PageMfaGuardTestWithAuthClient path="/mfa_guard/test/auth_client" />
        </ScrollToTop>
      </Router>
    </SettingsLayout>
  );
};

export default Settings;
