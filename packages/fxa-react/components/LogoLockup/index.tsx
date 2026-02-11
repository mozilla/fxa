/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactElement } from 'react';
import { Localized } from '@fluent/react';
import logo from '@fxa/shared/assets/images/moz-m-logo.svg';

type LogoLockupProps = {
  children: string | ReactElement;
  className?: string;
};

export const LogoLockup = ({ children, className = '' }: LogoLockupProps) => {
  return (
    <>
      <Localized id="app-logo-alt-3">
        <img src={logo} data-testid="logo" alt="Mozilla m logo" />
      </Localized>
      <h1
        data-testid="logo-text"
        className={`hidden tablet:inline-flex self-center text-xl ${className}`}
      >
        {children}
      </h1>
    </>
  );
};

export default LogoLockup;
