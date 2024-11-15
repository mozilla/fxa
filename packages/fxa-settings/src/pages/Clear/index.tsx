/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AppLayout from '../../components/AppLayout';
import { RouteComponentProps } from '@reach/router';

/* This page is only used for manual and Playwright tests and does not need l10n */
const Clear = (_: RouteComponentProps) => {
  try {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = 'tooyoung=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
  } catch (e) {
    // if cookies are disabled, this will blow up some browsers. Catch and do nothing instead.
  }

  return (
    <AppLayout>
      {/* TODO: intern doesn't have a "findByText" option so we've
        temporarily added this ID because intern tests still refer to this page
        and it's been rolled out to 100% in prod. Remove this ID once intern tests
        referring to this header are fully converted to Playwright. */}
      <h1 className="card-header text-center" id="clear-storage">
        Browser storage is cleared
      </h1>
    </AppLayout>
  );
};

export default Clear;
