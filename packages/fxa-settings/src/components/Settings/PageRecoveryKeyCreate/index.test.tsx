/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { usePageViewEvent, logViewEvent } from '../../../lib/metrics';
import PageRecoveryKeyCreate from '.';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

describe('PageRecoveryKeyCreate', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('renders as expected', () => {
    // Content will be updated as views are completed.
    render(<PageRecoveryKeyCreate />);
    expect(
      screen.getByText(
        'Create an account recovery key in case you forget your password'
      )
    ).toBeInTheDocument();
  });
  it('shifts views when the user clicks through the flow steps', () => {
    render(<PageRecoveryKeyCreate />);
    expect(
      screen.getByText(
        'Create an account recovery key in case you forget your password'
      )
    ).toBeInTheDocument();
    const nextButton = screen.getByText('Start creating your recovery key');
    fireEvent.click(nextButton);
    expect(screen.getByText('second step')).toBeInTheDocument();
  });
  it('emits expected page view metrics on load', async () => {
    render(<PageRecoveryKeyCreate />);
    await waitFor(() => {
      expect(usePageViewEvent).toHaveBeenCalledWith(
        'settings.account-recovery'
      );
    });
  });
});
