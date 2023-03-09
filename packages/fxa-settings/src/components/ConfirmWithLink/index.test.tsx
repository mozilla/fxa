/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen } from '@testing-library/react';
import { MOCK_ACCOUNT } from '../../models/mocks';
import {
  SubjectCanGoBack,
  SubjectWithEmailResendError,
  SubjectWithEmailResendSuccess,
} from './mocks';

jest.mock('../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

const mockCallback = jest.fn();

describe('ConfirmWithLink component', () => {
  // TODO: add tests for all metrics as they are added

  it("renders default view as expected with user's email", () => {
    render(<SubjectWithEmailResendSuccess />);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Confirm something');
    screen.getByText(
      `Open the mock link sent to ${MOCK_ACCOUNT.primaryEmail.email}`
    );
    screen.getByRole('button', { name: 'Not in inbox or spam folder? Resend' });
  });

  it('displays a success banner when resending a link is successful', () => {
    render(<SubjectWithEmailResendSuccess />);
    const resendEmailButton = screen.getByRole('button', {
      name: 'Not in inbox or spam folder? Resend',
    });
    fireEvent.click(resendEmailButton);
    screen.getByText(
      'Email resent. Add accounts@firefox.com to your contacts to ensure a smooth delivery.'
    );
  });

  it('displays an error banner when resending a link is unsuccessful', () => {
    render(<SubjectWithEmailResendError />);
    const resendEmailButton = screen.getByRole('button', {
      name: 'Not in inbox or spam folder? Resend',
    });
    fireEvent.click(resendEmailButton);
    screen.getByText('Something went wrong. A new link could not be sent.');
  });

  it('renders the expected view with the Back button when user can go back', async () => {
    render(<SubjectCanGoBack navigateBackHandler={mockCallback} />);

    const backLink = screen.getByRole('button', {
      name: 'Back',
    });
    fireEvent.click(backLink);
    expect(mockCallback).toHaveBeenCalled();
  });
});
