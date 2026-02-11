/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactElement } from 'react';

type HeaderProps = {
  left: ReactElement;
  right: ReactElement;
  className?: string;
  styles?: React.CSSProperties;
};

export const Header = (props: HeaderProps) => {
  return (
    <header
      data-testid="header"
      role="banner"
      className={props.className || 'sticky top-0 bg-grey-10 z-10'}
      style={props.styles}
    >
      <div className="px-6 tablet:px-8 py-4 flex justify-between">
        <div className="flex items-center">{props.left}</div>
        <div className="flex items-center">{props.right}</div>
      </div>
    </header>
  );
};

export default Header;
