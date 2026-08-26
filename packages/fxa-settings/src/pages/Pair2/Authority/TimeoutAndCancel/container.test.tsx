/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import Container from './container';
import firefox from '../../../../lib/channels/firefox';
import {
  Integration,
  PairingAuthorityIntegration,
} from '../../../../models';

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

const TIMEOUT_HEADING = 'Still want to connect a device?';
const CANCELED_HEADING = 'Canceled';

/** The reason travels in router state, set by whatever ended the flow. */
type MockAuthorityIntegration = PairingAuthorityIntegration & {
  destroy: jest.Mock;
};

function mockAuthorityIntegration(): MockAuthorityIntegration {
  const integration = Object.create(
    PairingAuthorityIntegration.prototype
  ) as MockAuthorityIntegration;
  return Object.assign(integration, {
    destroy: jest.fn().mockResolvedValue(undefined),
  });
}

const renderWithReason = (reason?: string, integration?: Integration) =>
  renderWithLocalizationProvider(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/pair/authority/timeout_and_cancel',
          state: reason ? { reason } : undefined,
        },
      ]}
    >
      <Container {...{ integration }} />
    </MemoryRouter>
  );

describe('Pair2/Authority/TimeoutAndCancel container', () => {
  let integration: MockAuthorityIntegration;

  beforeEach(() => {
    jest.clearAllMocks();
    integration = mockAuthorityIntegration();
  });

  it('renders the canceled variant when the flow was canceled', () => {
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

  // Timeout is the safe default: it is the variant offering a way back.
  it('falls back to the timeout variant when no reason was given', () => {
    renderWithReason(undefined, integration);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      TIMEOUT_HEADING
    );
  });

  it('sends the user back to the QR to try again', async () => {
    renderWithReason('timeout', integration);

    await userEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/pair/authority/scan_qr');
  });

  // Not every route here closes the channel first; this page always does.
  it('closes the pairing channel', async () => {
    renderWithReason('timeout', integration);

    await waitFor(() => expect(integration.destroy).toHaveBeenCalled());
  });

  // The user is at a dead end already; a failed close must not break the page.
  it('still renders when the channel cannot be closed', async () => {
    integration.destroy.mockRejectedValue(new Error('channel already gone'));

    renderWithReason('canceled', integration);

    await waitFor(() => expect(integration.destroy).toHaveBeenCalled());
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

  it('opens sync preferences from the canceled variant', async () => {
    const openSyncPreferences = jest
      .spyOn(firefox, 'fxaOpenSyncPreferences')
      .mockImplementation(() => {});
    renderWithReason('canceled', integration);

    await userEvent.click(
      screen.getByRole('button', { name: /sync settings/i })
    );

    expect(openSyncPreferences).toHaveBeenCalled();
  });
});
