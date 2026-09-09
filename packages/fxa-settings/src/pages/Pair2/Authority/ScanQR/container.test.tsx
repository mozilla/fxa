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

    // Nothing downstream can use a half-created channel, so this is the one
    // path that does tear it down.
    expect(integration.destroy).toHaveBeenCalled();
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

    expect(mockNavigate).toHaveBeenCalledWith(
      '/pair/authority/continue_on_mobile'
    );
  });

  it('navigates to the continue-on-mobile screen once the supplicant joins', async () => {
    renderContainer();
    await waitFor(() => expect(integration.onStateChange).toBeTruthy());

    emitState(integration, AuthorityState.WaitingForAuthorizations);

    expect(mockNavigate).toHaveBeenCalledWith(
      '/pair/authority/continue_on_mobile'
    );
  });

  it('navigates to the cancel screen when pairing fails', async () => {
    renderContainer();
    await waitFor(() => expect(integration.onStateChange).toBeTruthy());

    emitState(integration, AuthorityState.Failed);

    // The channel is closed before leaving, so the navigation trails it.
    await waitFor(() => expect(integration.destroy).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith(
      '/pair/authority/timeout_and_cancel',
      { state: { reason: 'timeout' } }
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

  // The channel outlives this page: the authority moves on to the next pairing
  // screen while the supplicant is still joining, so tearing it down on unmount
  // would drop the socket mid-flow.
  it('leaves the channel open on unmount', async () => {
    const { unmount } = renderContainer();
    await waitFor(() => expect(integration.createChannel).toHaveBeenCalled());

    unmount();

    expect(integration.destroy).not.toHaveBeenCalled();
  });

  // The channel outlives this page, but the handler must not. The integration
  // lasts the whole session, so a state change arriving after the user has
  // left pairing would otherwise pull them back into the flow.
  it('stops routing state changes once unmounted', async () => {
    const { unmount } = renderContainer();
    await waitFor(() => expect(integration.onStateChange).toBeTruthy());

    unmount();

    expect(integration.onStateChange).toBeNull();
    emitState(integration, AuthorityState.WaitingForAuthorizations);
    expect(mockNavigate).not.toHaveBeenCalled();
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
