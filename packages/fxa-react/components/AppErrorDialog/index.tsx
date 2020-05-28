/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';

const AppErrorDialog = ({ error }: { error: Error }) => {
  return (
    <div className="bg-grey-20 flex items-center flex-col justify-center h-screen">
      <div className="text-center max-w-lg">
        <h2
          className="text-grey-600 font-header text-lg font-bold mb-3"
          data-testid="error-loading-app"
        >
          General application error
        </h2>
        <p className="text-grey-400">
          Something went wrong. Please try again later.
        </p>
      </div>
    </div>
  );
};

export default AppErrorDialog;
