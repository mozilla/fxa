/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { isEmailValid } from 'fxa-shared/email/helpers';
import { Link, useLocation } from '@reach/router';

export type LinkRememberPasswordProps = {
  email?: string;
  clickHandler?: () => void;
  textStart?: boolean;
};

const LinkRememberPassword = ({
  email,
  clickHandler,
  textStart,
}: LinkRememberPasswordProps) => {
  const location = useLocation();

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    if (clickHandler) {
      // additional optional click handling behavior
      clickHandler();
    }
  };

  return (
    <div
      className={`flex flex-wrap mt-8 shrink-0 gap-1 text-sm ${
        textStart ? 'text-start' : 'justify-center'
      }`}
    >
      <FtlMsg id="remember-password-text">
        <p>Remember your password?</p>
      </FtlMsg>
      <FtlMsg id="remember-password-signin-link">
        <Link
          to={`/${location.search}`}
          state={{
            prefillEmail: email && isEmailValid(email) ? email : undefined,
          }}
          className="link-blue"
          id="remember-password"
          onClick={handleClick}
        >
          Sign in
        </Link>
      </FtlMsg>
    </div>
  );
};

export default LinkRememberPassword;
