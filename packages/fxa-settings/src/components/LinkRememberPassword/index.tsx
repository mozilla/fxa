/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg, hardNavigate } from 'fxa-react/lib/utils';
import { useLocation } from '@reach/router';
import { isEmailValid } from 'fxa-shared/email/helpers';

export type LinkRememberPasswordProps = {
  email?: string;
  clickHandler?: () => void;
};

const LinkRememberPassword = ({
  email,
  clickHandler,
}: LinkRememberPasswordProps) => {
  let linkHref: string;
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  params.delete('email');
  params.delete('hasLinkedAccount');
  params.delete('hasPassword');
  params.delete('showReactApp');

  if (email && isEmailValid(email)) {
    params.set('prefillEmail', email);
    linkHref = `/?${params.toString()}`;
  } else {
    linkHref = params.size > 0 ? `/?${params.toString()}` : '/';
  }

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    event.preventDefault();

    if (clickHandler) {
      // additional optional click handlong behavior
      clickHandler();
    }
    hardNavigate(linkHref);
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center text-sm mt-6">
      <FtlMsg id="remember-password-text">
        <p>Remember your password?</p>
      </FtlMsg>
      <FtlMsg id="remember-password-signin-link">
        {/* TODO in FXA-8636 replace with Link component */}
        <a
          href={linkHref}
          className="link-blue"
          id="remember-password"
          onClick={handleClick}
        >
          Sign in
        </a>
      </FtlMsg>
    </div>
  );
};

export default LinkRememberPassword;
