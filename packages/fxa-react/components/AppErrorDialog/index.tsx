/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Localized } from '@fluent/react';

const AppErrorDialog = ({ error }: { error: Error }) => {
  return (
    <div className="bg-grey-20 flex items-center flex-col justify-center h-screen">
      <div className="text-center max-w-lg">
        <Localized id="app-general-err-heading">
          <h2
            className="text-grey-900 font-header text-lg font-bold mb-3"
            data-testid="error-loading-app"
          >
            General application error
          </h2>
        </Localized>
        <Localized id="app-general-err-message">
          <p className="text-grey-400">
            Something went wrong. Please try again later.
          </p>
        </Localized>
        <p className="text-red-500 mt-4">{error.message}</p>
      </div>
    </div>
  );
};

export default AppErrorDialog;
