/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import AlertBar from '.';

jest.mock('@apollo/client', () => ({
  useReactiveVar: (x: Function) => x(),
}));

jest.mock('../../models', () => ({
  alertVisible: () => true,
  alertContent: () => 'message',
  alertType: () => 'info',
}));

describe('AlertBar', () => {
  it('renders as expected', () => {
    render(<AlertBar />);
    expect(screen.getByTestId('alert-bar-root')).toContainElement(
      screen.getByTestId('alert-bar')
    );
    expect(screen.getByTestId('alert-bar-content')).toBeInTheDocument();
    expect(screen.queryByTestId('alert-bar')).toHaveAttribute('role', 'alert');
    expect(screen.getByTestId('alert-bar-dismiss')).toHaveAttribute(
      'title',
      'Close message'
    );
  });

  it('shifts focus to the tab fence when rendered', () => {
    render(<AlertBar />);
    expect(document.activeElement).toBe(
      screen.getByTestId('alert-bar-tab-fence')
    );
  });
});
