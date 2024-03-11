/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
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

describe('ConfirmWithLink component', () => {
  it('renders default view as expected on initial page load', () => {
    renderWithLocalizationProvider(<SubjectWithEmailResendSuccess />);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Confirm something');
    screen.getByText(
      `Open the mock link sent to ${MOCK_ACCOUNT.primaryEmail.email}`
    );
    screen.getByRole('button', { name: 'Not in inbox or spam folder? Resend' });
    expect(
      screen.queryByRole('button', { name: 'Back' })
    ).not.toBeInTheDocument();
  });

  it('displays a success banner when resend status is set to sent', () => {
    renderWithLocalizationProvider(<SubjectWithEmailResendSuccess />);
    const resendEmailButton = screen.getByRole('button', {
      name: 'Not in inbox or spam folder? Resend',
    });
    expect(
      screen.queryByText(
        'Email re-sent. Add accounts@firefox.com to your contacts to ensure a smooth delivery.'
      )
    ).not.toBeInTheDocument();
    fireEvent.click(resendEmailButton);
    screen.getByText(
      'Email re-sent. Add accounts@firefox.com to your contacts to ensure a smooth delivery.'
    );
  });

  it('displays an error banner when resend status is set to error and an error message is provided', () => {
    renderWithLocalizationProvider(<SubjectWithEmailResendError />);
    const resendEmailButton = screen.getByRole('button', {
      name: 'Not in inbox or spam folder? Resend',
    });
    expect(
      screen.queryByText('Uh oh something went wrong')
    ).not.toBeInTheDocument();
    fireEvent.click(resendEmailButton);
    screen.getByText('Uh oh something went wrong');
  });

  it('renders a back button when provided with navigateBackHandler', async () => {
    renderWithLocalizationProvider(
      <SubjectCanGoBack navigateBackHandler={jest.fn()} />
    );

    screen.getByRole('button', { name: 'Back' });
  });
});
