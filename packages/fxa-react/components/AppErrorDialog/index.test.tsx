/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppErrorDialog from '.';
import { renderWithLocalizationProvider } from '../../lib/test-utils/localizationProvider';

const MOCK_SENTRY_EVENT_ID = '0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d';

describe('AppErrorDialog', () => {
  it('renders the "Something went wrong" heading for the general error type', () => {
    renderWithLocalizationProvider(<AppErrorDialog />);

    expect(
      screen.getByRole('heading', { name: 'Something went wrong' })
    ).toBeInTheDocument();
  });

  it('renders the invalid query parameters heading for the query-parameter-violation error type', () => {
    renderWithLocalizationProvider(
      <AppErrorDialog errorType="query-parameter-violation" />
    );

    expect(
      screen.getByRole('heading', {
        name: 'Bad Request: Invalid Query Parameters',
      })
    ).toBeInTheDocument();
  });

  it('omits the "we\'ve been notified" message for the query-parameter-violation type', () => {
    renderWithLocalizationProvider(
      <AppErrorDialog errorType="query-parameter-violation" />
    );

    expect(
      screen.queryByText(/we’ve been notified of the issue/i)
    ).not.toBeInTheDocument();
  });

  it('shows the Sentry error ID when provided', () => {
    renderWithLocalizationProvider(
      <AppErrorDialog sentryEventId={MOCK_SENTRY_EVENT_ID} />
    );

    expect(
      screen.getByText(`Error ID: ${MOCK_SENTRY_EVENT_ID}`)
    ).toBeInTheDocument();
  });

  it('reveals the error message when the error details toggle is expanded', async () => {
    const user = userEvent.setup();
    renderWithLocalizationProvider(
      <AppErrorDialog error={new Error('Invalid redirect parameter')} />
    );

    expect(screen.getByText('Invalid redirect parameter')).not.toBeVisible();

    await user.click(screen.getByText('Error details'));

    expect(screen.getByText('Invalid redirect parameter')).toBeVisible();
  });

  it('includes errno and code in the details when the error provides them', async () => {
    const user = userEvent.setup();
    const error = Object.assign(new Error('Invalid redirect parameter'), {
      errno: 102,
      code: 400,
    });
    renderWithLocalizationProvider(<AppErrorDialog error={error} />);

    await user.click(screen.getByText('Error details'));

    expect(screen.getByText(/errno: 102/)).toBeVisible();
    expect(screen.getByText(/code: 400/)).toBeVisible();
  });
});
