/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useLocation } from '@reach/router';

export type LinkRememberPasswordProps = {
  email?: string;
  forceAuth?: boolean;
};

const LinkRememberPassword = ({
  email,
  forceAuth = false,
}: LinkRememberPasswordProps) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  if (email) {
    params.set('email', email);
  }
  const linkHref = `${
    forceAuth ? '/force_auth' : '/signin'
  }?${params.toString()}`;

  return (
    <div className="text-sm mt-6">
      <FtlMsg id="remember-pw-link">
        {/* TODO: use Link component once signin is Reactified */}
        <a href={linkHref} className="link-blue text-sm" id="remember-password">
          Remember your password? Sign in
        </a>
      </FtlMsg>
    </div>
  );
};

export default LinkRememberPassword;
