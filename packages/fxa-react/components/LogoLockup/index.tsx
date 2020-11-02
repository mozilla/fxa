/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactElement } from 'react';
import logo from '../../images/ff-logo.svg';

type LogoLockupProps = {
  children: string | ReactElement;
};

export const LogoLockup = ({ children }: LogoLockupProps) => (
  <>
    <img
      src={logo}
      data-testid="logo"
      className="h-10 w-10 ltr:mr-4 rtl:ml-4"
      alt="Firefox logo"
    />
    <h1
      data-testid="logo-text"
      className="hidden tablet:inline-flex self-center text-xl"
    >
      {children}
    </h1>
  </>
);

export default LogoLockup;
