/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import { Localized } from '@fluent/react';

export type ErrorType = 'general' | 'query-parameter-violation';

const AppErrorDialog = ({ errorType }: { errorType?: ErrorType }) => {
  if (errorType == null) {
    errorType = 'general';
  }

  return (
    <div className="bg-grey-20 flex items-center flex-col justify-center">
      <div className="text-center max-w-lg">
        {errorType === 'general' && (
          <Localized id="app-general-err-heading">
            <h2
              className="text-grey-900 font-header text-lg font-bold mb-3"
              data-testid="error-loading-app"
            >
              General application error
            </h2>
          </Localized>
        )}
        {errorType === 'query-parameter-violation' && (
          <Localized id="app-query-parameter-err-heading">
            <h2
              className="text-grey-900 font-header text-lg font-bold mb-3"
              data-testid="error-bad-query-parameters"
            >
              Bad Request: Invalid Query Parameters
            </h2>
          </Localized>
        )}

        {errorType === 'general' && (
          <Localized id="app-general-err-message">
            <p className="text-grey-400">
              Something went wrong. Please try again later.
            </p>
          </Localized>
        )}
      </div>
    </div>
  );
};

export default AppErrorDialog;
