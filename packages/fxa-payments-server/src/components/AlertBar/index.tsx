/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';

import Portal from '@fxa-react/components/Portal';
import './index.scss';

type AlertBarProps = {
  children: any;
  className?: string;
};

export const AlertBar = ({ children, className = 'alert' }: AlertBarProps) => {
  return (
    <Portal id="top-bar">
      <div data-testid="alert-container" className={className}>
        {children}
      </div>
    </Portal>
  );
};

export default AlertBar;
