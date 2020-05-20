/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';

const AppErrorDialog = ({ error: { message } }: { error: Error }) => {
  return (
    <div>
      <h2 data-testid="error-loading-app">General application error</h2>
      <p>Something went wrong. Please try again later.</p>
    </div>
  );
};

export default AppErrorDialog;
