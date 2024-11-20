/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import * as Sentry from '@sentry/browser';
import SettingsLayout from './SettingsLayout';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import AppErrorDialog from 'fxa-react/components/AppErrorDialog';
import {
  useAccount,
  useConfig,
  useInitialSettingsState,
  useSession,
} from '../../models';
import {
  Redirect,
  Router,
  RouteComponentProps,
  useLocation,
} from '@reach/router';
import PageSettings from './PageSettings';
import PageChangePassword from './PageChangePassword';
import PageCreatePassword from './PageCreatePassword';
import PageSecondaryEmailAdd from './PageSecondaryEmailAdd';
import PageSecondaryEmailVerify from './PageSecondaryEmailVerify';
import { PageDisplayName } from './PageDisplayName';
import PageTwoStepAuthentication from './PageTwoStepAuthentication';
import { Page2faReplaceRecoveryCodes } from './Page2faReplaceRecoveryCodes';
import { PageDeleteAccount } from './PageDeleteAccount';
import { ScrollToTop } from './ScrollToTop';
import { SETTINGS_PATH } from '../../constants';
import { observeNavigationTiming } from 'fxa-shared/metrics/navigation-timing';
import PageAvatar from './PageAvatar';
import PageRecentActivity from './PageRecentActivity';
import PageRecoveryKeyCreate from './PageRecoveryKeyCreate';
import { hardNavigate } from 'fxa-react/lib/utils';
import { SettingsIntegration } from './interfaces';
import { currentAccount } from '../../lib/cache';
import { hasAccount, setCurrentAccount } from '../../lib/storage-utils';
import GleanMetrics from '../../lib/glean';
import Head from 'fxa-react/components/Head';

export const Settings = ({
  integration,
}: { integration: SettingsIntegration } & RouteComponentProps) => {
  const config = useConfig();
  const { metricsEnabled, hasPassword } = useAccount();
  const session = useSession();
  const account = useAccount();
  const location = useLocation();

  useEffect(() => {
    if (config.metrics.navTiming.enabled && metricsEnabled) {
      observeNavigationTiming(config.metrics.navTiming.endpoint);
    }
  }, [
    metricsEnabled,
    config.metrics.navTiming.enabled,
    config.metrics.navTiming.endpoint,
  ]);

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
        hardNavigate('/');
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
      hardNavigate('/');
    }
    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [account, session]);

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
    return <AppErrorDialog data-testid="error-dialog" {...{ error }} />;
  }

  return (
    <SettingsLayout>
      <Head />
      <Router basepath={SETTINGS_PATH}>
        <ScrollToTop default>
          <PageSettings path="/" />
          <PageDisplayName path="/display_name" />
          <PageAvatar path="/avatar" />
          {hasPassword ? (
            <PageRecoveryKeyCreate path="/account_recovery" />
          ) : (
            <Redirect from="/account_recovery" to="/settings" noThrow />
          )}
          {hasPassword ? (
            <>
              <PageChangePassword path="/change_password" />
              <Redirect
                from="/create_password"
                to="/settings/change_password"
                noThrow
              />
              <PageTwoStepAuthentication path="/two_step_authentication" />
              <Page2faReplaceRecoveryCodes path="/two_step_authentication/replace_codes" />
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
          <PageSecondaryEmailAdd path="/emails" />
          <PageSecondaryEmailVerify path="/emails/verify" />
          <PageRecentActivity path="/recent_activity" />
          <PageDeleteAccount path="/delete_account" />
          <Redirect from="/clients" to="/settings#connected-services" noThrow />
          {/* NOTE: `/settings/avatar/change` is used to link directly to the avatar page within Sync preferences settings on Firefox browsers */}
          <Redirect from="/avatar/change" to="/settings/avatar/" noThrow />
        </ScrollToTop>
      </Router>
    </SettingsLayout>
  );
};

export default Settings;
