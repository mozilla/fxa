/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import AppErrorBoundary from '.';

window.console.error = jest.fn();

describe('AppErrorBoundary', () => {
  it('renders children that do not cause exceptions', () => {
    const GoodComponent = () => <p data-testid="good-component">Hi</p>;

    render(
      <AppErrorBoundary>
        <GoodComponent />
      </AppErrorBoundary>
    );

    expect(screen.queryByTestId('error-loading-app')).not.toBeInTheDocument();
  });

  it('renders a general error dialog on exception in child component', () => {
    const BadComponent = () => {
      throw new Error('bad');
    };

    render(
      <AppErrorBoundary>
        <BadComponent />
      </AppErrorBoundary>
    );

    expect(screen.queryByTestId('error-loading-app')).toBeInTheDocument();
  });
});
