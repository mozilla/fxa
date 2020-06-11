/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import { useEscKeydownEffect, useChangeFocusEffect } from '../../lib/hooks';
import { ReactComponent as CloseIcon } from 'fxa-react/images/close.svg';

type AlertBarProps = {
  children: ReactNode | string;
  onDismiss: Function;
};

export const AlertBar = ({ children, onDismiss }: AlertBarProps) => {
  const tabFenceRef = useChangeFocusEffect();
  useEscKeydownEffect(onDismiss);

  return (
    <div
      className="flex fixed justify-center mt-2 mx-2 right-0 left-0"
      role="alert"
      data-testid="alert-bar"
    >
      <div className="max-w-2xl w-full desktop:min-w-sm flex shadow-md bg-green-500 rounded font-bold text-sm">
        <div
          tabIndex={0}
          ref={tabFenceRef}
          data-testid="alert-bar-tab-fence"
          className="outline-none"
        />
        <div className="flex-1 py-2 px-8 text-center">{children}</div>

        <div className="flex pr-1">
          <button
            data-testid="alert-bar-dismiss"
            className="self-center"
            onClick={onDismiss as () => void}
            title="Close message"
          >
            <CloseIcon className="w-3 h-3 m-2" role="img" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertBar;
