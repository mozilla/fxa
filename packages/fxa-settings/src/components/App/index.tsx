/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { gql, useQuery } from '@apollo/client';
import AppLayout from '../AppLayout';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import AppErrorDialog from 'fxa-react/components/AppErrorDialog';
import * as Metrics from '../../lib/metrics';
import { Account } from '../../models';
import { Router } from '@reach/router';
import FlowContainer from '../FlowContainer';
import PageSettings from '../PageSettings';
import PageChangePassword from '../PageChangePassword';
import PageSecondaryEmailAdd from '../PageSecondaryEmailAdd';
import PageSecondaryEmailVerify from '../PageSecondaryEmailVerify';

export const GET_INITIAL_STATE = gql`
  query GetInitialState {
    account {
      uid
      displayName
      avatarUrl
      accountCreated
      passwordCreated
      recoveryKey
      primaryEmail @client
      emails {
        email
        isPrimary
        verified
      }
      attachedClients {
        clientId
        isCurrentSession
        userAgent
        deviceType
        deviceId
      }
      totp {
        exists
        verified
      }
      subscriptions {
        created
        productName
      }
      alertTextExternal @client
    }
    session {
      verified
    }
  }
`;

type AppProps = {
  flowQueryParams: FlowQueryParams;
};

export const App = ({ flowQueryParams }: AppProps) => {
  const { loading, error } = useQuery<{ account: Account }>(GET_INITIAL_STATE);
  Metrics.init(flowQueryParams);

  if (loading) {
    return (
      <LoadingSpinner className="bg-grey-20 flex items-center flex-col justify-center h-screen select-none" />
    );
  }

  if (error) {
    return <AppErrorDialog data-testid="error-dialog" {...{ error }} />;
  }

  return (
    <AppLayout>
      <Router basepath="/beta/settings">
        <PageSettings path="/" />
        <FlowContainer path="/avatar/change" title="Profile picture" />
        <FlowContainer path="/display_name" title="Display name" />
        <PageChangePassword path="/change_password" />
        <PageSecondaryEmailAdd path="/emails" />
        <PageSecondaryEmailVerify path="/emails/verify" />
      </Router>
    </AppLayout>
  );
};

export default App;
