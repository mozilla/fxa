/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps, Router } from '@reach/router';
import Head from 'fxa-react/components/Head';
import { ScrollToTop } from '../Settings/ScrollToTop';
import Settings from '../Settings';
import { QueryParams } from '../..';
import CannotCreateAccount from '../../pages/CannotCreateAccount';

export const App = ({
  flowQueryParams,
}: { flowQueryParams: QueryParams } & RouteComponentProps) => {
  const { showReactApp } = flowQueryParams;

  return (
    <>
      <Head />
      <Router basepath={'/'}>
        <ScrollToTop default>
          {/* We probably don't need a guard here with `showReactApp` or a feature flag/config
           * check since users will be served the Backbone version of pages if either of those
           * are false, but guard with query param anyway since we have it handy */}
          {showReactApp && (
            <CannotCreateAccount path="/cannot_create_account/*" />
          )}

          <Settings path="/settings/*" {...{ flowQueryParams }} />
        </ScrollToTop>
      </Router>
    </>
  );
};

export default App;
