/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor } from '@testing-library/react';
import { SubjectWithoutCallbacks } from './mocks';
import { MOCK_ACCOUNT } from '../../models/mocks';

jest.mock('../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

const mockCallback = jest.fn();

afterEach(() => {
  mockCallback.mockClear();
});

describe('ConfirmWithLink component', () => {
  // TODO: add tests for all metrics as they are added

  it("renders default view as expected with user's email", () => {
    render(<SubjectWithoutCallbacks resendEmailCallback={mockCallback} />);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Confirm something');
    screen.getByText(
      `Open the mock link sent to ${MOCK_ACCOUNT.primaryEmail.email}`
    );
    screen.getByRole('button', { name: 'Not in inbox or spam folder? Resend' });
  });

  it('resends the email when the user clicks the resend button', async () => {
    render(<SubjectWithoutCallbacks resendEmailCallback={mockCallback} />);
    // check that the back button is present
    const resendEmailButton = screen.getByRole('button', {
      name: 'Not in inbox or spam folder? Resend',
    });
    resendEmailButton.click();
    await waitFor(() => expect(mockCallback).toBeCalled());
    // TO-DO: Once we know where this functionality is coming from, we'll be able to test it.
    // Add in a test to verify that it's called.
  });

  it('shows the Open Webmail button if in the appropriate context', () => {
    render(
      <SubjectWithoutCallbacks
        resendEmailCallback={mockCallback}
        withWebmailLink
      />
    );
    screen.getByRole('link', {
      name: /Open Gmail/,
    });
  });

  it('renders the expected view with the Back button when user can go back', async () => {
    render(
      <SubjectWithoutCallbacks
        goBackCallback={mockCallback}
        resendEmailCallback={mockCallback}
      />
    );

    const backLink = screen.getByRole('button', {
      name: 'Back',
    });
    backLink.click();
    await waitFor(() => expect(mockCallback).toBeCalled());
  });
});
