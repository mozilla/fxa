/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { Link } from '@reach/router';

export type LinkRememberPasswordProps = {
  email?: string;
  forceEmail?: string;
};

const LinkRememberPassword = ({
  email,
  forceEmail,
}: LinkRememberPasswordProps) => {
  const linkTarget = forceEmail ? '/force_auth' : '/signin';
  const queryParam = email || forceEmail || '';

  return (
    <div className="text-sm mt-6">
      <FtlMsg id="remember-pw-link">
        <Link
          to={`${linkTarget}?email=${encodeURIComponent(queryParam)}`}
          className="link-blue text-sm"
          id="remember-password"
        >
          Remember your password? Sign in
        </Link>
      </FtlMsg>
    </div>
  );
};

export default LinkRememberPassword;
