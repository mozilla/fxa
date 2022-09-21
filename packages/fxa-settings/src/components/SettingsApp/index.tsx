/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 import React, { useEffect, useContext } from 'react';
 import AppLayout from '../AppLayout';
 import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
 import AppErrorDialog from 'fxa-react/components/AppErrorDialog';
 import * as Metrics from '../../lib/metrics';
 import { useAccount, useConfig, useInitialState } from '../../models';
 import { FlowContext } from '../../models/FlowContext';
 import { Router, Redirect, RouteComponentProps } from '@reach/router';
 import PageSettings from '../PageSettings';
 import PageChangePassword from '../PageChangePassword';
 import PageCreatePassword from '../PageCreatePassword';
 import PageRecoveryKeyAdd from '../PageRecoveryKeyAdd';
 import PageSecondaryEmailAdd from '../PageSecondaryEmailAdd';
 import PageSecondaryEmailVerify from '../PageSecondaryEmailVerify';
 import { PageDisplayName } from '../PageDisplayName';
 import PageTwoStepAuthentication from '../PageTwoStepAuthentication';
 import { Page2faReplaceRecoveryCodes } from '../Page2faReplaceRecoveryCodes';
 import { PageDeleteAccount } from '../PageDeleteAccount';
 import { observeNavigationTiming } from 'fxa-shared/metrics/navigation-timing';
 import PageAvatar from '../PageAvatar';

 export const SettingsApp = (props: RouteComponentProps) => {
   const flowQueryParams = useContext(FlowContext);
   const config = useConfig();
   const { metricsEnabled, hasPassword } = useAccount();

   useEffect(() => {
     if (config.metrics.navTiming.enabled && metricsEnabled) {
       observeNavigationTiming(config.metrics.navTiming.endpoint);
     }
   }, [
     metricsEnabled,
     config.metrics.navTiming.enabled,
     config.metrics.navTiming.endpoint,
   ]);

   const { loading, error } = useInitialState();
   useEffect(() => {
    if (flowQueryParams) {
     Metrics.init(metricsEnabled, flowQueryParams);
    }
   }, [metricsEnabled, flowQueryParams]);

  //  In case of an invalid token the page will redirect,
  //  but to prevent a flash of the error message we show
  //  the spinner.
   if (loading || error?.message.includes('Invalid token')) {
     return (
       <LoadingSpinner className="bg-grey-20 flex items-center flex-col justify-center h-screen select-none" />
     );
   }

   if (error) {
     return <AppErrorDialog data-testid="error-dialog" {...{ error }} />;
   }

   return (
      <AppLayout>
        <Router>
          <PageSettings path="/" />
          <PageDisplayName path="/display_name" />
          <PageAvatar path="/avatar" />
          {hasPassword ? (
          <>
              <PageChangePassword path="/change_password" />
              <Redirect
              from="/create_password"
              to="/settings/change_password"
              noThrow
              />
              <PageRecoveryKeyAdd path="/account_recovery" />
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
          <PageDeleteAccount path="/delete_account" />
          <Redirect
          from="/clients"
          to="/settings#connected-services"
          noThrow
          />
          {/* NOTE: `/settings/avatar/change` is used to link directly to the avatar page within Sync preferences settings on Firefox browsers */}
          <Redirect from="/avatar/change" to="/settings/avatar/" noThrow />
          </Router>

      </AppLayout>
   );
 };

 export default SettingsApp;
