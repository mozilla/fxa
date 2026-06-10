/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import * as Sentry from '@sentry/browser';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { AppErrorBoundary } from '.';
import { ModelValidationErrors } from '../../lib/model-data';

jest.mock('@sentry/browser', () => ({
  captureException: jest.fn(),
}));

const MOCK_SENTRY_EVENT_ID = '0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d';

// Error boundaries log the thrown error; keep test output clean.
window.console.error = jest.fn();

const BadComponent = ({ error }: { error: Error }) => {
  throw error;
};

describe('AppErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Sentry.captureException as jest.Mock).mockReturnValue(
      MOCK_SENTRY_EVENT_ID
    );
  });

  it('renders children when no error occurs', () => {
    renderWithLocalizationProvider(
      <AppErrorBoundary>
        <p>all good</p>
      </AppErrorBoundary>
    );

    expect(screen.getByText('all good')).toBeInTheDocument();
  });

  it('catches a thrown error and displays the Sentry event ID', () => {
    renderWithLocalizationProvider(
      <AppErrorBoundary>
        <BadComponent error={new Error('boom')} />
      </AppErrorBoundary>
    );

    expect(
      screen.getByRole('heading', { name: 'Something went wrong' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Error ID: ${MOCK_SENTRY_EVENT_ID}`)
    ).toBeInTheDocument();
  });

  it('renders the invalid query parameters heading for ModelValidationErrors', () => {
    renderWithLocalizationProvider(
      <AppErrorBoundary>
        <BadComponent
          error={new ModelValidationErrors([], {}, 'QueryParameterValidation')}
        />
      </AppErrorBoundary>
    );

    expect(
      screen.getByRole('heading', {
        name: 'Bad Request: Invalid Query Parameters',
      })
    ).toBeInTheDocument();
  });
});
