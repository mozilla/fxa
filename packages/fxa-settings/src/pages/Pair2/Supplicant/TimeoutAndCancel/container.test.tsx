/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import * as Sentry from '@sentry/browser';
import Container from './container';
import { Integration, PairingSupplicantIntegration } from '../../../../models';

const TIMEOUT_HEADING = 'Looks like we timed out';
const CANCELED_HEADING = 'Canceled';

type MockSupplicantIntegration = PairingSupplicantIntegration & {
  destroy: jest.Mock;
};

function mockSupplicantIntegration(): MockSupplicantIntegration {
  const integration = Object.create(
    PairingSupplicantIntegration.prototype
  ) as MockSupplicantIntegration;
  return Object.assign(integration, {
    destroy: jest.fn().mockResolvedValue(undefined),
  });
}

const renderWithReason = (reason?: string, integration?: Integration) =>
  renderWithLocalizationProvider(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/pair/supplicant/timeout_and_cancel',
          state: reason ? { reason } : undefined,
        },
      ]}
    >
      <Container {...{ integration }} />
    </MemoryRouter>
  );

// The card has no actions: the container only reads the reason and closes the
// channel.
describe('Pair2/Supplicant/TimeoutAndCancel container', () => {
  let integration: MockSupplicantIntegration;

  beforeEach(() => {
    jest.clearAllMocks();
    integration = mockSupplicantIntegration();
  });

  it('renders the canceled variant when the user canceled', () => {
    renderWithReason('canceled', integration);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      CANCELED_HEADING
    );
  });

  it('renders the timeout variant when the flow timed out', () => {
    renderWithReason('timeout', integration);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      TIMEOUT_HEADING
    );
  });

  // Timeout is the safe default; a failure is likelier to arrive without state.
  it('falls back to the timeout variant when no reason was given', () => {
    renderWithReason(undefined, integration);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      TIMEOUT_HEADING
    );
  });

  // The cancel paths close the channel, the failure paths do not; this always
  // does.
  it('closes the pairing channel', async () => {
    renderWithReason('timeout', integration);

    await waitFor(() => expect(integration.destroy).toHaveBeenCalled());
  });

  it('still renders when the channel cannot be closed', async () => {
    const captureException = jest
      .spyOn(Sentry, 'captureException')
      .mockImplementation(() => '');
    const err = new Error('channel already gone');
    integration.destroy.mockRejectedValue(err);

    renderWithReason('canceled', integration);

    await waitFor(() => expect(captureException).toHaveBeenCalledWith(err));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      CANCELED_HEADING
    );
  });

  // The route passes whatever the app built, which is not always a pairing one.
  it('renders without a pairing integration', () => {
    renderWithReason('timeout', {} as Integration);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      TIMEOUT_HEADING
    );
  });
});
