/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { navigateWithQuery } from '../../../../lib/utilities';
import { pairingFlow } from '../../../../lib/channels/pairing-flow';
import Container from './container';

jest.mock('../../../../lib/utilities', () => ({
  ...jest.requireActual('../../../../lib/utilities'),
  navigateWithQuery: jest.fn(),
}));
jest.mock('../../../../lib/channels/pairing-flow', () => ({
  pairingFlow: { reset: jest.fn() },
}));

const mockNavigate = navigateWithQuery as jest.Mock;
const mockReset = pairingFlow.reset as jest.Mock;

const TIMEOUT_HEADING = 'Still want to connect a device?';
const CANCELED_HEADING = 'Canceled';

const renderAt = (search: string) =>
  renderWithLocalizationProvider(
    <MemoryRouter
      initialEntries={[`/pair/authority/timeout_and_cancel${search}`]}
    >
      <Container />
    </MemoryRouter>
  );

describe('Pair2/Authority/TimeoutAndCancel container', () => {
  afterEach(() => jest.clearAllMocks());

  it('renders the canceled variant when reason=canceled', () => {
    renderAt('?reason=canceled');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      CANCELED_HEADING
    );
  });

  it('renders the timeout variant when reason is missing', () => {
    renderAt('');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      TIMEOUT_HEADING
    );
  });

  it('resets the flow and returns to scan_qr on Try again', async () => {
    const user = userEvent.setup();
    renderAt('?reason=timeout');

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(mockReset).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/pair/authority/scan_qr');
  });

  it('goes to settings on Cancel', async () => {
    const user = userEvent.setup();
    renderAt('?reason=timeout');

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockNavigate).toHaveBeenCalledWith('/settings');
  });
});
