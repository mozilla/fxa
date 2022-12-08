/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';

const ResetPasswordLinkDamaged = () => {
  // TODO : Metric event(s) for damaged link

  return (
    <>
      <FtlMsg id="reset-pwd-link-damaged-header">
        <h1 id="fxa-reset-link-damaged-header" className="card-header">
          Reset password link damaged
        </h1>
      </FtlMsg>

      <FtlMsg id="reset-pwd-link-damaged-message">
        <p className="mt-4 text-sm">
          The link you clicked was missing characters, and may have been broken
          by your email client. Copy the address carefully, and try again.
        </p>
      </FtlMsg>
    </>
  );
};

export default ResetPasswordLinkDamaged;
