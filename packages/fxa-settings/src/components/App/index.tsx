/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AccountDataHOC from '../AccountDataHOC';
import AppLayout from '../AppLayout';
import Settings from '../Settings';
import AppErrorBoundary from 'fxa-react/components/AppErrorBoundary';
import FlowEvents from '../../lib/flow-event';

type AppProps = {
  queryParams: QueryParams;
};

export const App = ({ queryParams }: AppProps) => {
  FlowEvents.init(queryParams);

  return (
    <AppErrorBoundary>
      <AccountDataHOC>
        {({ account }: { account: AccountData }) => (
          <AppLayout
            avatarUrl={account.avatarUrl}
            primaryEmail={
              account.emails.find((email) => email.isPrimary)!.email
            }
            hasSubscription={Boolean(account.subscriptions.length)}
          >
            <Settings {...{ account }} />
          </AppLayout>
        )}
      </AccountDataHOC>
    </AppErrorBoundary>
  );
};

export default App;
