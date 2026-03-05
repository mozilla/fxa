/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';

export const ErrorAlert = ({ error }: { error: Error | unknown }) => {
  const message = error instanceof Error ? error.message : String(error);

  return (
    <div
      className="border border-red-400 text-red-700 px-4 py-3 my-4 rounded relative"
      role="alert"
      data-testid="error-alert"
    >
      <div className="font-bold py-2">Error</div>
      <p className="mb-6 pt-2">Something went wrong. Please try again later.</p>
      <hr />
      {message && (
        <p>
          <b>Message:</b> {message}
        </p>
      )}
    </div>
  );
};

export default ErrorAlert;
