/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';

type LogoLockupProps = {
  src: string;
  alt: string;
  text: string;
};

export const LogoLockup = ({ src, alt, text }: LogoLockupProps) => (
  <>
    <img
      className="logo inline-flex"
      src={require(`../../images/${src}`)}
      {...{ alt }}
    />
    <h1 className="inline-flex">{text}</h1>
  </>
);

export default LogoLockup;
