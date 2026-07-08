/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import * as Sentry from '@sentry/browser';
import SettingsLayout from './SettingsLayout';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import AppErrorDialog from 'fxa-react/components/AppErrorDialog';
import { useAccount, useAuthClient, useConfig, useSession } from '../../models';
import {
  useAccountData,
  InvalidTokenError,
} from '../../lib/hooks/useAccountData';
import { Routes, Route, Navigate, useLocation } from 'react-router';
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
import PageAvatar from './PageAvatar';
import PageRecentActivity from './PageRecentActivity';
import { MfaGuardPageRecoveryKeyCreate } from './PageRecoveryKeyCreate';
import { currentAccount, isSigningOut, sessionToken } from '../../lib/cache';
import { hasAccount, setCurrentAccount } from '../../lib/storage-utils';
import GleanMetrics from '../../lib/glean';
import Head from 'fxa-react/components/Head';
import { PageMfaGuardRecoveryPhoneRemove } from './PageRecoveryPhoneRemove';
import { MfaGuardPagePasskeyAdd } from './PagePasskeyAdd';
import { SettingsIntegration } from './interfaces';
import { useNavigateWithQuery } from '../../lib/hooks/useNavigateWithQuery';

import PageMfaGuardTestWithAuthClient from './PageMfaGuardTest';

export const Settings = ({
  integration,
  isSignedIntoFirefox = false,
}: {
  integration: SettingsIntegration;
  isSignedIntoFirefox?: boolean;
}) => {
  const session = useSession();
  const authClient = useAuthClient();
  const account = useAccount();
  const config = useConfig();
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
      try {
        const { details } = await authClient.sessionStatus(sessionToken()!);
        setSessionVerified(details.sessionVerified);
        setSessionVerificationMeetsAAL(
          details.sessionVerificationMeetsMinimumAAL
        );
      } catch (error) {
        setSessionVerified(false);
        setSessionVerificationMeetsAAL(false);
      }
    })();
  }, [authClient, sessionVerified, sessionVerificationMeetsAAL]);

  if (loading || sessionVerified === undefined) {
    return <LoadingSpinner fullScreen />;
  }

  // This error check includes a network error
  if (error) {
    // If the session token is invalid, redirect to signin.
    // Skip during sign-out to avoid racing with window.location.assign.
    if (error instanceof InvalidTokenError) {
      if (!isSigningOut()) {
        navigateWithQuery('/signin');
      }
      return <LoadingSpinner fullScreen />;
    }
    Sentry.captureException(error, { tags: { source: 'settings' } });
    GleanMetrics.error.view({ event: { reason: error.message } });
    return <AppErrorDialog data-testid="error-dialog" />;
  }

  // Redirect to root if the account or session is unverified. The try-catch
  // handles the case where account data may be missing from localStorage
  // (e.g. WKWebView storage eviction on iOS).
  try {
    if (account.primaryEmail.verified === false || sessionVerified === false) {
      console.warn(
        'Account or email verification is required to access /settings!'
      );
      navigateWithQuery('/');
      return <LoadingSpinner fullScreen />;
    }
  } catch {
    console.warn('Account data unavailable, redirecting to sign-in');
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

  const hasPassword = account.hasPassword;

  return (
    <SettingsLayout>
      <Head />
      <Routes>
        <Route
          index
          element={<PageSettings {...{ integration, isSignedIntoFirefox }} />}
        />
        <Route path="display_name" element={<PageDisplayName />} />
        <Route path="avatar" element={<PageAvatar />} />
        {/* MfaPageCreatePassword internally redirects to /change_password if password exists */}
        <Route path="create_password" element={<MfaPageCreatePassword />} />
        <Route path="two_step_authentication" element={<MfaGuardPage2faSetup />} />
        <Route path="two_step_authentication/change" element={<MfaGuardPage2faChange />} />
        <Route path="two_step_authentication/replace_codes" element={<MfaGuardPage2faReplaceBackupCodes />} />
        {hasPassword ? (
          <>
            <Route path="account_recovery" element={<MfaGuardPageRecoveryKeyCreate />} />
            <Route path="change_password" element={<MfaGuardedPageChangePassword />} />
          </>
        ) : (
          <>
            <Route path="change_password" element={<Navigate to="/settings/create_password" replace />} />
            <Route path="account_recovery" element={<Navigate to="/settings" replace />} />
          </>
        )}
        <Route path="emails" element={<MfaGuardPageSecondaryEmailAdd />} />
        <Route path="emails/verify" element={<MfaGuardPageSecondaryEmailVerify />} />
        <Route path="recent_activity" element={<PageRecentActivity />} />
        <Route path="delete_account" element={<PageDeleteAccount />} />
        <Route path="clients" element={<Navigate to="/settings#connected-services" replace />} />
        {/* NOTE: `/settings/avatar/change` is used to link directly to the avatar page within Sync preferences settings on Firefox browsers */}
        <Route path="avatar/change" element={<Navigate to="/settings/avatar/" replace />} />

        <Route path="recovery_phone/setup" element={<MfaGuardPageRecoveryPhoneSetup />} />
        <Route path="recovery_phone/remove" element={<PageMfaGuardRecoveryPhoneRemove />} />

        {config.featureFlags?.passkeysEnabled &&
          config.featureFlags?.passkeyRegistrationEnabled && (
            <Route path="passkeys/add" element={<MfaGuardPagePasskeyAdd />} />
          )}

        <Route path="mfa_guard/test/auth_client" element={<PageMfaGuardTestWithAuthClient />} />
      </Routes>
    </SettingsLayout>
  );
};

export default Settings;
