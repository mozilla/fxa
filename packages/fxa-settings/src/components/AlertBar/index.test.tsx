/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import AlertBar from '.';
import { AlertBarRootAndContextProvider } from '../../lib/AlertBarContext';

describe('AlertBar', () => {
  const onDismiss = jest.fn();

  it('renders as expected', () => {
    const { rerender } = render(<AlertBarRootAndContextProvider />);
    rerender(
      <AlertBarRootAndContextProvider>
        <AlertBar {...{ onDismiss }}>
          <div data-testid="children">Message</div>
        </AlertBar>
      </AlertBarRootAndContextProvider>
    );
    expect(screen.getByTestId('alert-bar-root')).toContainElement(
      screen.getByTestId('alert-bar')
    );
    expect(screen.queryByTestId('children')).toBeInTheDocument();
    expect(screen.queryByTestId('alert-bar')).toHaveAttribute('role', 'alert');
    expect(screen.getByTestId('alert-bar-dismiss')).toHaveAttribute(
      'title',
      'Close message'
    );
  });

  it('uses Portal as a backup if alert-bar-root is not present', () => {
    render(
      <AlertBar {...{ onDismiss }}>
        <div>Message</div>
      </AlertBar>
    );

    expect(screen.getByTestId('alert-bar-portal')).toBeInTheDocument;
  });

  it('calls onDismiss on button click', () => {
    const { rerender } = render(<AlertBarRootAndContextProvider />);
    rerender(
      <AlertBarRootAndContextProvider>
        <AlertBar {...{ onDismiss }}>
          <div data-testid="children">Message</div>
        </AlertBar>
      </AlertBarRootAndContextProvider>
    );
    fireEvent.click(screen.getByTestId('alert-bar-dismiss'));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('calls onDismiss on esc key press', () => {
    const { rerender } = render(<AlertBarRootAndContextProvider />);
    rerender(
      <AlertBarRootAndContextProvider>
        <AlertBar {...{ onDismiss }}>
          <div data-testid="children">Message</div>
        </AlertBar>
      </AlertBarRootAndContextProvider>
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onDismiss).toHaveBeenCalled();
  });

  it('shifts focus to the tab fence when rendered', () => {
    const { rerender } = render(<AlertBarRootAndContextProvider />);
    rerender(
      <AlertBarRootAndContextProvider>
        <AlertBar {...{ onDismiss }}>
          <div data-testid="children">Message</div>
        </AlertBar>
      </AlertBarRootAndContextProvider>
    );
    expect(document.activeElement).toBe(
      screen.getByTestId('alert-bar-tab-fence')
    );
  });
});
