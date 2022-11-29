/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { Localized } from '@fluent/react';

type ResetPasswordVerifiedProps = {
  // obviously needs the actual types
  service: String;
};

// eslint-disable-next-line no-empty-pattern
const ResetPasswordVerified = ({
  service,
}: ResetPasswordVerifiedProps & RouteComponentProps) => {
  return (
    <>
      <header className="mb-4">
        <h1 className="text-xl mb-2">Your password has been reset</h1>
      </header>

      <section>
        <div className="error"></div>
        <Localized id="pw-reset-warning">
          <p className="my-4 text-sm">You’re now ready to use ${service}</p>
        </Localized>
      </section>
    </>
  );
};

export default ResetPasswordVerified;
