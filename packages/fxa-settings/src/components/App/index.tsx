/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AppLayout from '../AppLayout';
import AppErrorBoundary from '@fxa-components/AppErrorBoundary';
import { QueryParams } from '../../lib/types';
import FlowEvents from '../../lib/flow-event';
import './index.scss';

type AppProps = {
  queryParams: QueryParams;
};

export const App = ({ queryParams }: AppProps) => {
  FlowEvents.init(queryParams);

  return (
    <AppErrorBoundary>
      <AppLayout>
        <p>Hello, world!</p>
      </AppLayout>
    </AppErrorBoundary>
  );
};

export default App;
