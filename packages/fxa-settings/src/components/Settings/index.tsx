/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { lazy, useEffect, useMemo, useRef, useState } from 'react';
import * as Sentry from '@sentry/browser';
import SettingsLayout from './SettingsLayout';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import AppErrorDialog from 'fxa-react/components/AppErrorDialog';
import { hardNavigate } from 'fxa-react/lib/utils';
import { useAccount, useAuthClient, useConfig } from '../../models';
import {
  useAccountData,
  InvalidTokenError,
  useNavigateWithQuery,
} from '../../lib/hooks';
import { Routes, Route, Navigate, useLocation } from 'react-router';
import PageSettings from './PageSettings';
import { currentAccount, isSigningOut, sessionToken } from '../../lib/cache';
import GleanMetrics from '../../lib/glean';
import Head from 'fxa-react/components/Head';
import { SettingsIntegration } from './interfaces';

// The App's /settings/* Suspense boundary shows the spinner while these load.
const MfaGuardedPageChangePassword = lazy(() => import('./PageChangePassword'));
const MfaPageCreatePassword = lazy(() => import('./PageCreatePassword'));
const MfaGuardPageSecondaryEmailAdd = lazy(() =>
  import('./PageSecondaryEmailAdd').then((m) => ({
    default: m.MfaGuardPageSecondaryEmailAdd,
  }))
);
const MfaGuardPageSecondaryEmailVerify = lazy(() =>
  import('./PageSecondaryEmailVerify').then((m) => ({
    default: m.MfaGuardPageSecondaryEmailVerify,
  }))
);
const PageDisplayName = lazy(() =>
  import('./PageDisplayName').then((m) => ({ default: m.PageDisplayName }))
);
const MfaGuardPage2faSetup = lazy(() =>
  import('./Page2faSetup').then((m) => ({ default: m.MfaGuardPage2faSetup }))
);
const MfaGuardPage2faChange = lazy(() =>
  import('./Page2faChange').then((m) => ({ default: m.MfaGuardPage2faChange }))
);
const MfaGuardPage2faReplaceBackupCodes = lazy(() =>
  import('./Page2faReplaceBackupCodes').then((m) => ({
    default: m.MfaGuardPage2faReplaceBackupCodes,
  }))
);
const MfaGuardPageRecoveryPhoneSetup = lazy(() =>
  import('./PageRecoveryPhoneSetup').then((m) => ({
    default: m.MfaGuardPageRecoveryPhoneSetup,
  }))
);
const PageDeleteAccount = lazy(() =>
  import('./PageDeleteAccount').then((m) => ({ default: m.PageDeleteAccount }))
);
const PageAvatar = lazy(() => import('./PageAvatar'));
const PageRecentActivity = lazy(() => import('./PageRecentActivity'));
const MfaGuardPageRecoveryKeyCreate = lazy(() =>
  import('./PageRecoveryKeyCreate').then((m) => ({
    default: m.MfaGuardPageRecoveryKeyCreate,
  }))
);
const PageMfaGuardRecoveryPhoneRemove = lazy(() =>
  import('./PageRecoveryPhoneRemove').then((m) => ({
    default: m.PageMfaGuardRecoveryPhoneRemove,
  }))
);
const MfaGuardPagePasskeyAdd = lazy(() =>
  import('./PagePasskeyAdd').then((m) => ({
    default: m.MfaGuardPagePasskeyAdd,
  }))
);

// Reporting happens in an effect rather than during render so that a repeated
// render of the error branch cannot report the same failure twice.
const SettingsError = ({ error }: { error: Error }) => {
  const reported = useRef(false);
  const [sentryEventId, setSentryEventId] = useState<string>();

  useEffect(() => {
    if (reported.current) {
      return;
    }
    reported.current = true;
    setSentryEventId(
      Sentry.captureException(error, { tags: { source: 'settings' } })
    );
    GleanMetrics.error.view({ event: { reason: error.message } });
  }, [error]);

  return <AppErrorDialog {...{ error, sentryEventId }} />;
};

// Content-server serves this app for every /settings/* path, so leave it for the 404 page.
const NotFoundRedirect = () => {
  useEffect(() => {
    hardNavigate('/404', {}, false, true);
  }, []);
  return <LoadingSpinner fullScreen />;
};

export const Settings = ({
  integration,
  isSignedIntoFirefox = false,
  browserHasSyncKey,
}: {
  integration: SettingsIntegration;
  isSignedIntoFirefox?: boolean;
  browserHasSyncKey?: boolean;
}) => {
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
    // Read the store, not account.uid: the Account.data getter reports a missing account to Sentry.
    function handleWindowFocus() {
      if (!currentAccount()?.uid) {
        console.warn('Could not locate current account in local storage');
        navigateWithQuery('/');
      }
    }
    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [navigateWithQuery]);

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

  // Derive the redirect here and navigate from the effect below; a
  // render-phase navigation races the commit.
  const redirect = useMemo<{
    to: string;
    options?: Parameters<typeof navigateWithQuery>[1];
  } | null>(() => {
    if (loading || sessionVerified === undefined) {
      return null; // still loading, no redirect
    }

    if (error) {
      if (error instanceof InvalidTokenError) {
        if (!isSigningOut()) {
          return { to: '/signin' };
        }
        return null; // signing out, just show spinner
      }
      // Non-token errors are not redirects; handled in render below
      return null;
    }

    try {
      if (
        account.primaryEmail.verified === false ||
        sessionVerified === false
      ) {
        console.warn(
          'Account or email verification is required to access /settings!'
        );
        return { to: '/' };
      }
    } catch {
      console.warn('Account data unavailable, redirecting to sign-in');
      return { to: '/' };
    }

    // Multi-device 2FA: user set up TOTP on device A and must upgrade AAL
    // on device B's session token before accessing Settings.
    if (sessionVerificationMeetsAAL === false) {
      console.warn('2FA must be entered to access /settings!');
      const storedAccount = currentAccount();
      return {
        to: '/signin_totp_code',
        options: {
          state: {
            email: storedAccount?.email,
            sessionToken: storedAccount?.sessionToken,
            uid: storedAccount?.uid,
            verified: storedAccount?.verified,
            isSessionAALUpgrade: true,
          },
        },
      };
    }

    return null;
  }, [loading, sessionVerified, error, account, sessionVerificationMeetsAAL]);

  useEffect(() => {
    if (redirect) {
      navigateWithQuery(redirect.to, redirect.options);
    }
  }, [redirect, navigateWithQuery]);

  if (loading || sessionVerified === undefined) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    if (error instanceof InvalidTokenError) {
      return <LoadingSpinner fullScreen />;
    }
    return <SettingsError {...{ error }} />;
  }

  if (redirect) {
    return <LoadingSpinner fullScreen />;
  }

  const hasPassword = account.hasPassword;

  return (
    <SettingsLayout>
      <Head />
      <Routes>
        <Route
          index
          element={
            <PageSettings
              {...{ integration, isSignedIntoFirefox, browserHasSyncKey }}
            />
          }
        />
        <Route path="display_name" element={<PageDisplayName />} />
        <Route path="avatar" element={<PageAvatar />} />
        {/* MfaPageCreatePassword internally redirects to /change_password if password exists */}
        <Route path="create_password" element={<MfaPageCreatePassword />} />
        <Route
          path="two_step_authentication"
          element={<MfaGuardPage2faSetup />}
        />
        <Route
          path="two_step_authentication/change"
          element={<MfaGuardPage2faChange />}
        />
        <Route
          path="two_step_authentication/replace_codes"
          element={<MfaGuardPage2faReplaceBackupCodes />}
        />
        {hasPassword ? (
          <>
            <Route
              path="account_recovery"
              element={<MfaGuardPageRecoveryKeyCreate />}
            />
            <Route
              path="change_password"
              element={<MfaGuardedPageChangePassword />}
            />
          </>
        ) : (
          <>
            <Route
              path="change_password"
              element={<Navigate to="/settings/create_password" replace />}
            />
            <Route
              path="account_recovery"
              element={<Navigate to="/settings" replace />}
            />
          </>
        )}
        <Route path="emails" element={<MfaGuardPageSecondaryEmailAdd />} />
        <Route
          path="emails/verify"
          element={<MfaGuardPageSecondaryEmailVerify />}
        />
        <Route path="recent_activity" element={<PageRecentActivity />} />
        <Route path="delete_account" element={<PageDeleteAccount />} />
        <Route
          path="clients"
          element={<Navigate to="/settings#connected-services" replace />}
        />
        {/* NOTE: `/settings/avatar/change` is used to link directly to the avatar page within Sync preferences settings on Firefox browsers */}
        <Route
          path="avatar/change"
          element={<Navigate to="/settings/avatar/" replace />}
        />

        <Route
          path="recovery_phone/setup"
          element={<MfaGuardPageRecoveryPhoneSetup />}
        />
        <Route
          path="recovery_phone/remove"
          element={<PageMfaGuardRecoveryPhoneRemove />}
        />

        {config.featureFlags?.passkeysEnabled &&
          config.featureFlags?.passkeyRegistrationEnabled && (
            <Route path="passkeys/add" element={<MfaGuardPagePasskeyAdd />} />
          )}
        <Route path="*" element={<NotFoundRedirect />} />
      </Routes>
    </SettingsLayout>
  );
};

export default Settings;
