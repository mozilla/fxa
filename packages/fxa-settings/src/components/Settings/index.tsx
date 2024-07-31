/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import AppLayout from './AppLayout';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import AppErrorDialog from 'fxa-react/components/AppErrorDialog';
import {
  useAccount,
  useConfig,
  useInitialSettingsState,
  useSession,
} from '../../models';
import { Redirect, Router, RouteComponentProps } from '@reach/router';
import Head from 'fxa-react/components/Head';
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
import { HomePath } from '../../constants';
import { observeNavigationTiming } from 'fxa-shared/metrics/navigation-timing';
import PageAvatar from './PageAvatar';
import PageRecentActivity from './PageRecentActivity';
import PageRecoveryKeyCreate from './PageRecoveryKeyCreate';
import { hardNavigate } from 'fxa-react/lib/utils';
import { SettingsIntegration } from './interfaces';
import { currentAccount } from '../../lib/cache';
import { setCurrentAccount } from '../../lib/storage-utils';

export const Settings = ({
  integration,
}: { integration: SettingsIntegration } & RouteComponentProps) => {
  const config = useConfig();
  const { metricsEnabled, hasPassword } = useAccount();
  const session = useSession();
  const account = useAccount();

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
    function handleWindowFocus() {
      if (account.uid !== currentAccount()?.uid) {
        setCurrentAccount(account.uid);
      }
      if (session.isDestroyed) {
        hardNavigate('/');
      }
    }
    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [account, session]);

  const { loading, error } = useInitialSettingsState();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  // This error check includes a network error
  if (error) {
    return <AppErrorDialog data-testid="error-dialog" {...{ error }} />;
  }

  return (
    <AppLayout {...{ integration }}>
      <Head />
      <Router basepath={HomePath}>
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
    </AppLayout>
  );
};

export default Settings;
