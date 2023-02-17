/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { Link } from '@reach/router';

export type LinkRememberPasswordProps = {
  email?: string;
  forceAuth?: boolean;
};

const LinkRememberPassword = ({
  email,
  forceAuth,
}: LinkRememberPasswordProps) => {
  const linkTarget = `${forceAuth ? '/force_auth' : '/signin'}`;
  let target = linkTarget;
  if (email) {
    target = `${linkTarget}?email=${encodeURIComponent(email)}`;
  }
  return (
    <div className="text-sm mt-6">
      <FtlMsg id="remember-pw-link">
        <a href={target} className="link-blue text-sm" id="remember-password">
          Remember your password? Sign in
        </a>
      </FtlMsg>
    </div>
  );
};

export default LinkRememberPassword;
