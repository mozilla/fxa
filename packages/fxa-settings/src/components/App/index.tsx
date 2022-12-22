/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps, Router } from '@reach/router';
import Head from 'fxa-react/components/Head';
import { ScrollToTop } from '../Settings/ScrollToTop';
import Settings from '../Settings';
import { QueryParams } from '../..';
import PageCannotCreateAccount from '../PageCannotCreateAccount';
import config from '../../lib/config';

export const App = ({
  flowQueryParams,
}: { flowQueryParams: QueryParams } & RouteComponentProps) => {
  const { showReactApp } = flowQueryParams;
  const { simpleRoutes } = config.showContentServer;

  return (
    <>
      <Head />
      <Router basepath={'/'}>
        <ScrollToTop default>
          {showReactApp === true && simpleRoutes === true ? (
            <PageCannotCreateAccount path="/cannot_create_account/*" />
          ) : (
            <>
              {window.location.assign(
                `${window.location.origin}/cannot_create_account`
              )}
            </>
          )}

          <Settings path="/settings/*" {...{ flowQueryParams }} />
        </ScrollToTop>
      </Router>
    </>
  );
};

export default App;
