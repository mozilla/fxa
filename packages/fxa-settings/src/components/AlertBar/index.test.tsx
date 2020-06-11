/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import AlertBar from './index';

describe('AlertBar', () => {
  const onDismiss = jest.fn();

  it('renders as expected', () => {
    render(
      <AlertBar {...{ onDismiss }}>
        <div data-testid="children">Message</div>
      </AlertBar>
    );
    expect(screen.queryByTestId('children')).toBeInTheDocument();
    expect(screen.queryByTestId('alert-bar')).toHaveAttribute('role', 'alert');
    expect(screen.getByTestId('alert-bar-dismiss')).toHaveAttribute(
      'title',
      'Close message'
    );
  });

  it('calls onDismiss on button click', () => {
    render(
      <AlertBar {...{ onDismiss }}>
        <div>Message</div>
      </AlertBar>
    );
    fireEvent.click(screen.getByTestId('alert-bar-dismiss'));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('calls onDismiss on esc key press', () => {
    render(
      <AlertBar {...{ onDismiss }}>
        <p>Message</p>
      </AlertBar>
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onDismiss).toHaveBeenCalled();
  });

  it('shifts focus to the tab fence when rendered', () => {
    render(
      <AlertBar {...{ onDismiss }}>
        <p>Message</p>
      </AlertBar>
    );
    expect(document.activeElement).toBe(
      screen.getByTestId('alert-bar-tab-fence')
    );
  });
});
