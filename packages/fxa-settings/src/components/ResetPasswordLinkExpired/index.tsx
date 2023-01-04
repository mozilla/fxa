/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';

const ResetPasswordLinkExpired = () => {
  // TODO : Metric event(s) for expired link

  const resendLinkHandler = () => {
    //   TODO: add resend link action
  };

  return (
    <>
      <FtlMsg id="reset-pwd-link-expired-header">
        <h1 id="fxa-reset-link-expired-header" className="card-header">
          Reset password link expired
        </h1>
      </FtlMsg>

      <FtlMsg id="reset-pwd-link-expired-message">
        <p className="mt-4 text-sm">
          The link you clicked to reset your password is expired.
        </p>
      </FtlMsg>
      <FtlMsg id="reset-pwd-resend-link">
        <button
          onClick={resendLinkHandler}
          className="cta-primary cta-base-p mt-4"
        >
          Receive new link
        </button>
      </FtlMsg>
    </>
  );
};

export default ResetPasswordLinkExpired;
