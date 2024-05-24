/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useLocation } from '@reach/router';
import { isEmailValid } from 'fxa-shared/email/helpers';

export type LinkRememberPasswordProps = {
  email?: string;
  forceAuth?: boolean;
};

const LinkRememberPassword = ({ email }: LinkRememberPasswordProps) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  let linkHref: string;
  if (email && isEmailValid(email)) {
    params.set('prefillEmail', email);
    // react and backbone signin handle email/prefill params differently so
    // go back to index - any errors (like throttling) will be shown there on submit
    linkHref = `/?${params}`;
  } else {
    linkHref = params.size > 0 ? `/?${params}` : '/';
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center text-sm mt-6">
      <FtlMsg id="remember-password-text">
        <p>Remember your password?</p>
      </FtlMsg>
      <FtlMsg id="remember-password-signin-link">
        {/* TODO in FXA-8636 replace with Link component */}
        <a href={linkHref} className="link-blue" id="remember-password">
          Sign in
        </a>
      </FtlMsg>
    </div>
  );
};

export default LinkRememberPassword;
