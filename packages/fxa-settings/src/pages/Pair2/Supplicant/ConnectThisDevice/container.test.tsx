/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import * as Sentry from '@sentry/browser';
import ConnectThisDeviceContainer from './container';
import { MOCK_METADATA_WITH_DEVICE_NAME } from '../../../../components/DeviceInfoBlock/mocks';
import { MOCK_EMAIL } from '../../../mocks';
import {
  Integration,
  PairingSupplicantIntegration,
  SupplicantState,
} from '../../../../models';
import { navigateWithQuery } from '../../../../lib/utilities';

const mockNavigate = jest.fn();

// The channel credentials reach this page in router state rather than the URL,
// so the location is mocked instead of driving a real router entry.
let mockLocationState: unknown = {
  version: '2',
  channelId: 'chan-1',
  channelKey: 'key-1',
};
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: mockLocationState }),
}));

jest.mock('../../../../lib/utilities', () => ({
  ...jest.requireActual('../../../../lib/utilities'),
  navigateWithQuery: jest.fn(),
}));

type MockSupplicantIntegration = PairingSupplicantIntegration & {
  openChannel: jest.Mock;
  supplicantApprove: jest.Mock;
  destroy: jest.Mock;
};

/**
 * A `PairingSupplicantIntegration` with the channel surface stubbed. Built from
 * the real prototype because the container narrows on `instanceof` before it
 * touches any of it.
 */
function mockSupplicantIntegration(): MockSupplicantIntegration {
  const integration = Object.create(
    PairingSupplicantIntegration.prototype
  ) as MockSupplicantIntegration;

  // Both are getters on the prototype, so they cannot be assigned.
  Object.defineProperty(integration, 'remoteMetadata', {
    get: () => MOCK_METADATA_WITH_DEVICE_NAME,
  });
  Object.defineProperty(integration, 'email', { get: () => MOCK_EMAIL });

  return Object.assign(integration, {
    openChannel: jest.fn().mockResolvedValue(undefined),
    supplicantApprove: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    onStateChange: null,
  });
}

const emitState = (
  integration: MockSupplicantIntegration,
  state: SupplicantState
) => (integration as PairingSupplicantIntegration).onStateChange?.(state);

// This container owns the supplicant's end of the channel: it opens one from
// the credentials the QR carried, then waits for the authority's metadata
// before it can ask the user to connect.
describe('Pair2/Supplicant/ConnectThisDevice container', () => {
  let integration: MockSupplicantIntegration;
  let captureException: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocationState = {
      version: '2',
      channelId: 'chan-1',
      channelKey: 'key-1',
    };
    integration = mockSupplicantIntegration();
    captureException = jest
      .spyOn(Sentry, 'captureException')
      .mockImplementation(() => '');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderContainer = (i: Integration = integration) =>
    renderWithLocalizationProvider(
      <ConnectThisDeviceContainer integration={i} />
    );

  // The credentials come off the scanned QR, so the channel this page opens has
  // to be the one the authority minted.
  it('opens the channel the QR pointed at', async () => {
    renderContainer();

    await waitFor(() =>
      expect(integration.openChannel).toHaveBeenCalledWith(
        expect.anything(),
        'chan-1',
        'key-1',
        2
      )
    );
  });

  it('renders the device details once the authority metadata arrives', async () => {
    renderContainer();
    await waitFor(() => expect(integration.onStateChange).toBeTruthy());

    emitState(integration, SupplicantState.WaitingForAuthorizations);

    expect(
      await screen.findByRole('heading', { level: 1 })
    ).toBeInTheDocument();
    screen.getByText(MOCK_EMAIL);
  });

  it('navigates to the approve-sign-in screen once the supplicant is approved', async () => {
    renderContainer();
    await waitFor(() => expect(integration.onStateChange).toBeTruthy());

    emitState(integration, SupplicantState.WaitingForAuthority);

    expect(navigateWithQuery).toHaveBeenCalledWith(
      '/pair/supplicant/approve_signin',
      {},
      true
    );
  });

  it('navigates to the cancel screen when pairing fails', async () => {
    renderContainer();
    await waitFor(() => expect(integration.onStateChange).toBeTruthy());

    emitState(integration, SupplicantState.Failed);

    expect(navigateWithQuery).toHaveBeenCalledWith(
      '/pair/supplicant/timeout_and_cancel',
      {},
      true
    );
  });

  // A channel that never opens leaves the user on a spinner forever, so the
  // failure has to route rather than disappear into an unhandled rejection.
  it('reports and leaves the screen when the channel cannot be opened', async () => {
    const err = new Error('channel server unreachable');
    integration.openChannel.mockRejectedValue(err);

    renderContainer();

    await waitFor(() => expect(captureException).toHaveBeenCalledWith(err));
    expect(mockNavigate).toHaveBeenCalledWith(
      '/pair/supplicant/timeout_and_cancel'
    );
  });

  describe('once the user can act', () => {
    const renderReady = async () => {
      const result = renderContainer();
      await waitFor(() => expect(integration.onStateChange).toBeTruthy());
      emitState(integration, SupplicantState.WaitingForAuthorizations);
      await screen.findByRole('button', { name: 'Connect' });
      return result;
    };

    it('approves on the pairing channel when the user connects', async () => {
      const user = userEvent.setup();
      await renderReady();

      await user.click(
        screen.getByRole('button', { name: 'Connect' })
      );

      expect(integration.supplicantApprove).toHaveBeenCalledTimes(1);
      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith(
          '/pair/supplicant/approve_signin'
        )
      );
    });

    // The reason has to travel with the navigation: without it the dead-end
    // screen blames a timeout for a pairing the user deliberately stopped.
    it('closes the channel before leaving for the cancel screen', async () => {
      const user = userEvent.setup();
      await renderReady();

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => expect(integration.destroy).toHaveBeenCalled());
      expect(navigateWithQuery).toHaveBeenCalledWith(
        '/pair/supplicant/timeout_and_cancel',
        { state: { reason: 'canceled' } },
        true
      );
    });

    // The user asked to stop, so a channel that will not close cleanly cannot
    // keep them on a screen that is waiting on a pairing they cancelled.
    it('still leaves for the cancel screen when the channel cannot be closed', async () => {
      const user = userEvent.setup();
      const err = new Error('channel server unreachable');
      integration.destroy.mockRejectedValue(err);
      await renderReady();

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => expect(captureException).toHaveBeenCalledWith(err));
      expect(navigateWithQuery).toHaveBeenCalledWith(
        '/pair/supplicant/timeout_and_cancel',
        { state: { reason: 'canceled' } },
        true
      );
    });
  });

  // The channel outlives this page: the supplicant moves on to approve_signin
  // while the authority is still approving, so tearing it down on unmount would
  // drop the socket mid-flow.
  it('leaves the channel open on unmount', async () => {
    const { unmount } = renderContainer();
    await waitFor(() => expect(integration.openChannel).toHaveBeenCalled());

    unmount();

    expect(integration.destroy).not.toHaveBeenCalled();
  });

  // The flip side: the handler must not outlive the page. The integration lasts
  // the whole session, so a state change arriving after the user has left
  // pairing would otherwise pull them back into the flow.
  it('stops routing state changes once unmounted', async () => {
    const { unmount } = renderContainer();
    await waitFor(() => expect(integration.onStateChange).toBeTruthy());

    unmount();

    expect(integration.onStateChange).toBeNull();
    emitState(integration, SupplicantState.WaitingForAuthority);
    expect(navigateWithQuery).not.toHaveBeenCalled();
  });

  it('throws when handed an integration that is not the pairing supplicant', () => {
    expect(() => renderContainer({} as Integration)).toThrow(
      'Invalid integration. Expecting instance of PairingSupplicantIntegration'
    );
  });

  // Only pairing v2 routes through this page; a v1 channel would be driven by
  // the legacy supplicant screens instead.
  it('throws when the router state is not a v2 pairing', () => {
    mockLocationState = { version: '1' };

    expect(() => renderContainer()).toThrow(
      'Invalid location state. Expecting version of 2.'
    );
  });
});
