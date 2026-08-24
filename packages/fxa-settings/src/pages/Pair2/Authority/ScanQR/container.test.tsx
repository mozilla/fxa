/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { MemoryRouter } from 'react-router';
import * as Sentry from '@sentry/react';
import ScanQRContainer from './container';
import {
  MOCK_NON_PAIRING_INTEGRATION,
  MOCK_PAIR_URL,
  MockAuthorityIntegration,
  emitState,
  mockAuthorityIntegration,
} from './mocks';
import { AuthorityState, Integration } from '../../../../models';

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

// Stub QRCode so the test can read the encoded value without decoding an SVG.
// The container's contract is the value it hands down; how that value is drawn
// is the page's concern, covered in index.test.tsx.
jest.mock('../../../../components/QRCode', () => ({
  __esModule: true,
  default: ({
    value,
    localizedLabel,
    loading,
  }: {
    value: string;
    localizedLabel: string;
    loading?: boolean;
  }) => (
    <img
      alt={localizedLabel}
      data-testid="scan-qr-code"
      data-value={value}
      data-loading={String(!!loading)}
    />
  ),
}));

// The container owns the pairing channel: it mints one on mount so the QR
// always scans to a channel that exists on the channel server, routes the
// integration's state changes, and closes the channel on the way out.
describe('Pair2/Authority/ScanQR container', () => {
  let integration: MockAuthorityIntegration;
  let captureException: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    integration = mockAuthorityIntegration();
    captureException = jest
      .spyOn(Sentry, 'captureException')
      .mockImplementation(() => '');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderContainer = (i: Integration = integration) =>
    renderWithLocalizationProvider(
      <MemoryRouter>
        <ScanQRContainer integration={i} />
      </MemoryRouter>
    );

  it('renders the ScanQR page', () => {
    renderContainer();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Scan to connect your mobile device'
    );
  });

  it('creates a channel and encodes its pair URL in the QR', async () => {
    renderContainer();

    await waitFor(() => expect(integration.createChannel).toHaveBeenCalled());
    expect(integration.getPairUrl).toHaveBeenCalledWith('2');
    expect(await screen.findByTestId('scan-qr-code')).toHaveAttribute(
      'data-value',
      MOCK_PAIR_URL
    );
  });

  it('shows the QR as loading until the channel is created', () => {
    renderContainer();

    expect(screen.getByTestId('scan-qr-code')).toHaveAttribute(
      'data-loading',
      'true'
    );
  });

  // Storing the pair URL re-renders the container. If the effect were keyed on
  // anything that changes per render, that re-render would tear the channel
  // down and mint a second one the supplicant's QR no longer points at.
  it('creates the channel once, not again on the re-render its own state causes', async () => {
    renderContainer();

    await waitFor(() =>
      expect(screen.getByTestId('scan-qr-code')).toHaveAttribute(
        'data-value',
        MOCK_PAIR_URL
      )
    );
    expect(integration.createChannel).toHaveBeenCalledTimes(1);
    expect(integration.destroy).not.toHaveBeenCalled();
  });

  // A failed create must not leave a QR encoding a channel the supplicant
  // cannot join.
  it('leaves the QR unset and reports to Sentry when the channel cannot be created', async () => {
    const err = new Error('channel server unreachable');
    integration.createChannel.mockRejectedValue(err);

    renderContainer();

    await waitFor(() => expect(captureException).toHaveBeenCalledWith(err));
    expect(screen.getByTestId('scan-qr-code')).toHaveAttribute(
      'data-value',
      ''
    );
    expect(integration.getPairUrl).not.toHaveBeenCalled();
  });

  // The channel exists but its URL cannot be built — same user-visible outcome
  // as a failed create, and it must not escape as an unhandled rejection.
  it('leaves the QR unset and reports to Sentry when the pair URL cannot be built', async () => {
    const err = new Error('missing channel key');
    integration.getPairUrl.mockImplementation(() => {
      throw err;
    });

    renderContainer();

    await waitFor(() => expect(captureException).toHaveBeenCalledWith(err));
    expect(screen.getByTestId('scan-qr-code')).toHaveAttribute(
      'data-value',
      ''
    );
  });

  // The handler is assigned before the channel is awaited, so a state change
  // arriving mid-creation still routes.
  it('routes a state change that arrives before the channel is created', () => {
    integration.createChannel.mockReturnValue(new Promise(() => {}));
    renderContainer();

    emitState(integration, AuthorityState.WaitingForAuthorizations);

    expect(mockNavigate).toHaveBeenCalledWith('/pair/authority/approve_signin');
  });

  it('navigates to the approval screen once the supplicant joins', async () => {
    renderContainer();
    await waitFor(() => expect(integration.onStateChange).toBeTruthy());

    emitState(integration, AuthorityState.WaitingForAuthorizations);

    expect(mockNavigate).toHaveBeenCalledWith('/pair/authority/approve_signin');
  });

  it('navigates to the cancel screen when pairing fails', async () => {
    renderContainer();
    await waitFor(() => expect(integration.onStateChange).toBeTruthy());

    emitState(integration, AuthorityState.Failed);

    expect(mockNavigate).toHaveBeenCalledWith(
      '/pair/authority/timeout_and_cancel'
    );
  });

  it.each([AuthorityState.Connecting, AuthorityState.WaitingForMetadata])(
    'stays on the page in the %s state, which resolves here',
    async (state) => {
      renderContainer();
      await waitFor(() => expect(integration.onStateChange).toBeTruthy());

      emitState(integration, state);

      expect(mockNavigate).not.toHaveBeenCalled();
    }
  );

  it('destroys the integration on unmount so leaving cannot leak a socket', async () => {
    const { unmount } = renderContainer();
    await waitFor(() => expect(integration.createChannel).toHaveBeenCalled());

    unmount();

    expect(integration.destroy).toHaveBeenCalled();
  });

  // Effect cleanup cannot await, so a rejected close has to be caught rather
  // than escaping as an unhandled rejection.
  it('reports a failed teardown to Sentry', async () => {
    const err = new Error('close failed');
    integration.destroy.mockRejectedValue(err);
    const { unmount } = renderContainer();
    await waitFor(() => expect(integration.createChannel).toHaveBeenCalled());

    unmount();

    await waitFor(() => expect(captureException).toHaveBeenCalledWith(err));
  });

  it('throws when handed an integration that is not the pairing authority', () => {
    expect(() => renderContainer(MOCK_NON_PAIRING_INTEGRATION)).toThrow(
      'Invalid integration type. Expected PairingAuthorityIntegration.'
    );
  });

  // The authority is the already-signed-in desktop browser; a phone cannot
  // display a QR for another phone to scan.
  it('throws when the authority is a Firefox mobile client', () => {
    integration.isFirefoxMobileClient.mockReturnValue(true);

    expect(() => renderContainer()).toThrow('Mobile to desktop not supported!');
  });

  it('never opens a channel for a rejected integration', () => {
    integration.isFirefoxMobileClient.mockReturnValue(true);

    expect(() => renderContainer()).toThrow();
    expect(integration.createChannel).not.toHaveBeenCalled();
  });
});
