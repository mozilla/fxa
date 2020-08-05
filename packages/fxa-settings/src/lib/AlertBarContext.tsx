/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 // Test coverage for this file exists in AlertBar tests.

import React, { useRef, ReactNode } from 'react';

type AlertBarContextType = {
  alertBarRootRef: React.RefObject<HTMLDivElement>;
};

const defaultAlertBarContext = {
  alertBarRootRef: {
    current: null
  }
};

const AlertBarContext = React.createContext<AlertBarContextType>(
  defaultAlertBarContext
);

// Only used in tests and Storybook.
export const AlertBarRootAndContextProvider = ({children}: {children?: ReactNode}) => {
  const alertBarRootRef = useRef<HTMLDivElement>(null);
  return (
    <>
      <div id="alert-bar-root" data-testid="alert-bar-root" ref={alertBarRootRef} />
      <AlertBarContext.Provider value={{ alertBarRootRef }}>
        {children}
      </AlertBarContext.Provider>
    </>
  )
}

export default AlertBarContext;
