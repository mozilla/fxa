/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode, useContext } from 'react';
import { createPortal } from 'react-dom';
import AlertBarContext from '../../lib/AlertBarContext';
import { useEscKeydownEffect, useChangeFocusEffect } from '../../lib/hooks';
import { ReactComponent as CloseIcon } from 'fxa-react/images/close.svg';
import Portal from 'fxa-react/components/Portal';

export type AlertBarType = 'success' | 'error' | 'info';

type AlertBarProps = {
  children: ReactNode;
  onDismiss: Function;
  type?: AlertBarType;
};

export const typeClasses = {
  success: 'text-grey-600 bg-green-500',
  error: 'text-white bg-red-500',
  info: 'text-white bg-blue-500',
};

export const AlertBar = ({
  children,
  onDismiss,
  type = 'success',
}: AlertBarProps) => {
  const { alertBarRootRef } = useContext(AlertBarContext);

  // Although `role="alert" is usually sufficient to trigger a screenreader
  // without having to reset focus, if this component is rerendered before
  // it's removed from the DOM, the message won't be read. Setting focus
  // ensures screenreaders receive feedback and makes the "close" button
  // the next tabbable element after reveal.
  const tabFenceRef = useChangeFocusEffect();
  useEscKeydownEffect(onDismiss);

  const alertBar = (
    <div
      className="flex fixed justify-center mt-2 mx-2 right-0 left-0"
      role="alert"
      data-testid="alert-bar"
    >
      <div
        data-testid="alert-bar-inner"
        className={`max-w-2xl w-full desktop:min-w-sm flex shadow-md rounded font-bold text-sm ${typeClasses[type]}`}
      >
        <div
          tabIndex={0}
          ref={tabFenceRef}
          data-testid="alert-bar-tab-fence"
          className="outline-none"
        />
        <div className="flex-1 py-2 px-8 text-center">{children}</div>
        <div className="flex">
          <button
            data-testid="alert-bar-dismiss"
            className={`self-center rounded-r h-full px-1 ${typeClasses[type]} hover:bg-black hover:bg-opacity-20 active:bg-opacity-30`}
            onClick={onDismiss as () => void}
            title="Close message"
          >
            <CloseIcon className="w-3 h-3 m-2 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );

  if (alertBarRootRef.current) {
    return createPortal(alertBar, alertBarRootRef.current);
  } else {
    // this should never happen, but log an error and use Portal as a backup
    console.error(
      'Attempted to mount AlertBar on element ID "alert-bar-root" but it was not found in the document.'
    );
    return (
      <Portal id="alert-bar-portal">
        <div className="fixed mt-16 top-0 z-10" data-testid="alert-bar-portal">
          {alertBar}
        </div>
      </Portal>
    );
  }
};

export default AlertBar;
