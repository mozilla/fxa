/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { usePageViewEvent } from '../../../lib/metrics';
import PageRecoveryKeyCreate from '.';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

describe('PageRecoveryKeyCreate', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('renders as expected', () => {
    // Content will be updated as views are completed.
    render(<PageRecoveryKeyCreate />);
    expect(screen.getByText('first step')).toBeInTheDocument();
  });
  it('shifts views when the user clicks through the flow steps', () => {
    render(<PageRecoveryKeyCreate />);
    expect(screen.getByText('first step')).toBeInTheDocument();
    // TODO: We'll have to update this as the views are completed.
    const nextButton = screen.getByText('click to move to next view');
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
