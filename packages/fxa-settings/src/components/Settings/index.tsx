/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import * as Sentry from '@sentry/browser';
import SettingsLayout from './SettingsLayout';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import AppErrorDialog from 'fxa-react/components/AppErrorDialog';
import { useAccount, useInitialSettingsState, useSession } from '../../models';
import {
  Redirect,
  Router,
  RouteComponentProps,
  useLocation,
} from '@reach/router';
import PageSettings from './PageSettings';
import MfaGuardedPageChangePassword from './PageChangePassword';
import PageCreatePassword from './PageCreatePassword';
import { MfaGuardPageSecondaryEmailAdd } from './PageSecondaryEmailAdd';
import { MfaGuardPageSecondaryEmailVerify } from './PageSecondaryEmailVerify';
import { PageDisplayName } from './PageDisplayName';
import Page2faSetup from './Page2faSetup';
import { PageMfaGuard2faReplaceBackupCodes } from './Page2faReplaceBackupCodes';
import { MfaGuardPageRecoveryPhoneSetup } from './PageRecoveryPhoneSetup';
import { PageDeleteAccount } from './PageDeleteAccount';
import { ScrollToTop } from './ScrollToTop';
import { SETTINGS_PATH } from '../../constants';
import PageAvatar from './PageAvatar';
import PageRecentActivity from './PageRecentActivity';
import { MfaGuardPageRecoveryKeyCreate } from './PageRecoveryKeyCreate';
import { currentAccount } from '../../lib/cache';
import { hasAccount, setCurrentAccount } from '../../lib/storage-utils';
import GleanMetrics from '../../lib/glean';
import Head from 'fxa-react/components/Head';
import PageRecoveryPhoneRemove from './PageRecoveryPhoneRemove';
import { SettingsIntegration } from './interfaces';
import { useNavigateWithQuery } from '../../lib/hooks/useNavigateWithQuery';
import MfaGuardPage2faChange from './Page2faChange';
import PageMfaGuardTestWithAuthClient from './PageMfaGuardTest';
import PageMfaGuardTestWithGql from './PageMfaGuardWithGqlTest';

export const Settings = ({
  integration,
}: { integration: SettingsIntegration } & RouteComponentProps) => {
  const session = useSession();
  const account = useAccount();
  const location = useLocation();
  const navigateWithQuery = useNavigateWithQuery();

  useEffect(() => {
    /**
     * If we have an active session, we need to handle the possibility
     * that it will reflect the session for the current tab. It's
     * important to note that there is also a cache in local storage, and
     * as such it is shared between all tabs. So, in the event a user has
     * account A signed in on tab 1, and account B signed in on tab 2, local
     * storage will reflect the account uid of whichever account was the last
     * to be sign in.
     *
     * By noting the window focus, we actively swap the current account uid
     * in local storage so that it matches the apollo cache's account uid,
     * which is held in page memory, thereby fixing this discrepancy.
     *
     * Having multiple things cached in multiple places is never great, so we
     * have a ticket in the backlog for cleaning this up, and avoiding this
     * hack in the future. See FXA-9875 for more info.
     */
    function handleWindowFocus() {
      // Try to retrieve the active account uid from the apollo cache.
      const accountUidFromApolloCache = (() => {
        try {
          return account.uid;
        } catch {}
        return undefined;
      })();

      // During normal usage, we should not see this. However, if this happens many
      // functions on the page would be broken, because it indicates the apollo
      // for the active account was cleared. In this case, navigate back to the
      // signin page
      if (accountUidFromApolloCache === undefined) {
        console.warn('Could not access account.uid from apollo cache!');
        navigateWithQuery('/');
        return;
      }

      // If the current account in local storage matches the account in the
      // apollo cache, the state is syncrhonized and no action is required.
      if (currentAccount()?.uid === accountUidFromApolloCache) {
        return;
      }

      // If there is not a match, and the state exists in local storage, swap
      // the active account, so apollo cache and localstorage are in sync.
      if (hasAccount(accountUidFromApolloCache)) {
        setCurrentAccount(accountUidFromApolloCache);
        return;
      }

      // We have hit an unexpected state. The account UID reflected by the apollo
      // cache does not match any known account state in local storage.
      // This is could occur if:
      //  - The same account was signed out on another tab
      //  - A user localstorage was manually cleared.
      //
      // Either way, we cannot reliable sync up apollo cache and localstorage, so
      // we will direct back to the login page.
      console.warn('Could not locate current account in local storage');
      navigateWithQuery('/');
    }
    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [account, navigateWithQuery, session]);

  const { loading, error } = useInitialSettingsState();
  const { enabled: gleanEnabled } = GleanMetrics.useGlean();

  useEffect(() => {
    gleanEnabled && GleanMetrics.pageLoad(location.pathname);
  }, [location.pathname, gleanEnabled]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  // This error check includes a network error
  if (error) {
    Sentry.captureException(error, { tags: { source: 'settings' } });
    GleanMetrics.error.view({ event: { reason: error.message } });
    return <AppErrorDialog data-testid="error-dialog" />;
  }

  // If the account email isn't verified, kick back to root to prompt for verification.
  // This should only happen if the user tries to access /settings directly
  // without entering a confirmation code on confirm_signup_code page.
  // Session verification requirement and redirect is handled on initial app load
  // (look for isUnverifiedSessionError in lib/gql.ts for that handling)
  if (account.primaryEmail.verified === false) {
    console.warn('Account verification is require to access /settings!');
    navigateWithQuery('/');
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
          {account.hasPassword ? (
            <MfaGuardPageRecoveryKeyCreate path="/account_recovery" />
          ) : (
            <Redirect from="/account_recovery" to="/settings" noThrow />
          )}
          {account.hasPassword ? (
            <>
              <MfaGuardedPageChangePassword path="/change_password" />
              <Redirect
                from="/create_password"
                to="/settings/change_password"
                noThrow
              />
              <Page2faSetup path="/two_step_authentication" />
              <MfaGuardPage2faChange path="/two_step_authentication/change" />
              <PageMfaGuard2faReplaceBackupCodes path="/two_step_authentication/replace_codes" />
            </>
          ) : (
            <>
              <PageCreatePassword path="/create_password" />
              <Redirect
                from="/change_password"
                to="/settings/create_password"
                noThrow
              />
              <Redirect from="/account_recovery" to="/settings" noThrow />
              <Redirect
                from="/two_step_authentication"
                to="/settings"
                noThrow
              />
              <Redirect
                from="/two_step_authentication/replace_codes"
                to="/settings"
                noThrow
              />
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
          <PageRecoveryPhoneRemove path="/recovery_phone/remove" />

          <PageMfaGuardTestWithAuthClient path="/mfa_guard/test/auth_client" />
          <PageMfaGuardTestWithGql path="/mfa_guard/test/gql" />
        </ScrollToTop>
      </Router>
    </SettingsLayout>
  );
};

export default Settings;
