/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import AlertExternal from './index';
import { AlertBarRootAndContextProvider } from '../../lib/AlertBarContext';
import { Account, AccountContext } from '../../models';

describe('AlertExternal', () => {
  it('renders as expected', () => {
    const account = ({
      alertTextExternal: 'ok',
    } as unknown) as Account;
    const { rerender } = render(
      <AccountContext.Provider value={{ account }}>
        <AlertBarRootAndContextProvider />
      </AccountContext.Provider>
    );
    rerender(
      <AccountContext.Provider value={{ account }}>
        <AlertBarRootAndContextProvider>
          <AlertExternal />
        </AlertBarRootAndContextProvider>
      </AccountContext.Provider>
    );
    expect(screen.getByTestId('alert-bar-root')).toContainElement(
      screen.getByTestId('alert-bar')
    );
    expect(screen.queryByTestId('alert-external-text')).toBeInTheDocument();
  });

  it('does not render with no alertTextExternal text', () => {
    const account = ({
      alertTextExternal: null,
    } as unknown) as Account;
    const { rerender } = render(
      <AccountContext.Provider value={{ account }}>
        <AlertBarRootAndContextProvider />
      </AccountContext.Provider>
    );
    rerender(
      <AccountContext.Provider value={{ account }}>
        <AlertBarRootAndContextProvider>
          <AlertExternal />
        </AlertBarRootAndContextProvider>
      </AccountContext.Provider>
    );
    expect(screen.queryByTestId('alert-external-text')).not.toBeInTheDocument();
  });
});
