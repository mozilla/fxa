/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useRef, ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import AlertExternal from './index';
import { AlertBarRootAndContextProvider } from '../../lib/AlertBarContext';
import { MockedCache } from '../../models/_mocks';

describe('AlertExternal', () => {
  it('renders as expected', () => {
    const { rerender } = render(
      <MockedCache account={{ alertTextExternal: 'ok' }}>
        <AlertBarRootAndContextProvider />
      </MockedCache>
    );
    rerender(
      <MockedCache account={{ alertTextExternal: 'ok' }}>
        <AlertBarRootAndContextProvider>
          <AlertExternal />
        </AlertBarRootAndContextProvider>
      </MockedCache>
    );
    expect(screen.getByTestId('alert-bar-root')).toContainElement(
      screen.getByTestId('alert-bar')
    );
    expect(screen.queryByTestId('alert-external-text')).toBeInTheDocument();
  });

  it('does not render with no alertTextExternal text', () => {
    const { rerender } = render(
      <MockedCache>
        <AlertBarRootAndContextProvider />
      </MockedCache>
    );
    rerender(
      <MockedCache>
        <AlertBarRootAndContextProvider>
          <AlertExternal />
        </AlertBarRootAndContextProvider>
      </MockedCache>
    );
    expect(screen.queryByTestId('alert-external-text')).not.toBeInTheDocument();
  });
});
