/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import * as Sentry from '@sentry/browser';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import OAuthDataError from '.';

jest.mock('@sentry/browser', () => ({
  captureException: jest.fn(),
}));

jest.mock('../../models', () => ({
  useFtlMsgResolver: () => ({
    getMsg: (_id: string, fallback: string) => fallback,
  }),
}));

jest.mock('../../models/hooks', () => ({
  useConfig: jest.fn(() => ({ featureFlags: {} })),
  useFtlMsgResolver: () => ({
    getMsg: (_id: string, fallback: string) => fallback,
  }),
}));

const MOCK_AUTH_ERROR = { message: 'Unexpected error', errno: 999 };
const MOCK_SENTRY_EVENT_ID = '0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d';

describe('OAuthDataError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the error page and displays the captured Sentry event ID', () => {
    (Sentry.captureException as jest.Mock).mockReturnValue(
      MOCK_SENTRY_EVENT_ID
    );

    // Local copy: the component stamps sentryEventId onto the error.
    renderWithLocalizationProvider(
      <OAuthDataError error={{ ...MOCK_AUTH_ERROR }} />
    );

    expect(
      screen.getByRole('heading', { name: 'Bad Request' })
    ).toBeInTheDocument();
    expect(screen.getByText('Unexpected error')).toBeInTheDocument();
    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error), {
      tags: { source: 'OAuthDataError', errno: 999 },
    });
    expect(
      screen.getByText(`Error ID: ${MOCK_SENTRY_EVENT_ID}`)
    ).toBeInTheDocument();
  });

  it('reuses the event ID from an error already captured at its throw site', () => {
    renderWithLocalizationProvider(
      <OAuthDataError
        error={{ ...MOCK_AUTH_ERROR, sentryEventId: MOCK_SENTRY_EVENT_ID }}
      />
    );

    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(
      screen.getByText(`Error ID: ${MOCK_SENTRY_EVENT_ID}`)
    ).toBeInTheDocument();
  });
});
