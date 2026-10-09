/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { MemoryRouter } from 'react-router';
import * as Sentry from '@sentry/react';
import ScanQRContainer, { SIGNED_IN_POLL_MS } from './container';
import firefox from '../../../../lib/channels/firefox';
import {
  MOCK_NON_PAIRING_INTEGRATION,
  MOCK_PAIR_URL,
  MockAuthorityIntegration,
  emitState,
  mockAuthorityIntegration,
} from './mocks';
import { AuthorityState, Integration } from '../../../../models';
import * as ReactUtils from 'fxa-react/lib/utils';
import { mockUseFxAStatus } from '../../../../lib/hooks/useFxAStatus/mocks';
import type { UseFxAStatusResult } from '../../../../lib/hooks';
import type { SignedInUser } from '../../../../lib/channels/firefox';

const MOCK_SIGNED_IN_USER: SignedInUser = {
  uid: 'sync-uid',
  email: 'sync@example.com',
  sessionToken: 'token',
  verified: true,
};

/** What Firefox answers on fxa_status for the given account, if any. */
const signedInStatus = (
  signedInUser: SignedInUser | undefined
): UseFxAStatusResult => {
  const result = mockUseFxAStatus({ pairingVersion: 2 });
  return { ...result, fxaStatus: { ...result.fxaStatus, signedInUser } };
};

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

const mockQrSkip = jest.fn();
jest.mock('../../../../lib/glean', () => ({
  __esModule: true,
  default: {
    dtmDesktop: {
      qrSkip: (...args: unknown[]) => mockQrSkip(...args),
    },
  },
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

  const renderContainer = (
    i: Integration = integration,
    fxaStatusResult: UseFxAStatusResult = signedInStatus(MOCK_SIGNED_IN_USER)
  ) =>
    renderWithLocalizationProvider(
      <MemoryRouter>
        <ScanQRContainer integration={i} {...{ fxaStatusResult }} />
      </MemoryRouter>
    );

  // The QR is only useful while the browser can approve the sign-in it leads
  // to, so the channel is gated on fxa_status.
  describe('browser sign-in status', () => {
    let hardNavigate: jest.SpyInstance;

    beforeEach(() => {
      hardNavigate = jest
        .spyOn(ReactUtils, 'hardNavigate')
        .mockImplementation(() => {});
    });

    it('waits for fxa_status before opening a channel', () => {
      renderContainer(
        integration,
        mockUseFxAStatus({ fxaStatusState: 'pending' })
      );

      expect(integration.createChannel).not.toHaveBeenCalled();
      expect(hardNavigate).not.toHaveBeenCalled();
    });

    it.each([
      ['no signed-in user', undefined],
      ['an unverified user', { ...MOCK_SIGNED_IN_USER, verified: false }],
      [
        'a disconnected user',
        { ...MOCK_SIGNED_IN_USER, sessionToken: undefined },
      ],
    ])(
      'sends the browser back to /pair without a channel when it reports %s',
      (_, signedInUser) => {
        renderContainer(integration, signedInStatus(signedInUser));

        expect(hardNavigate).toHaveBeenCalledWith('/pair', {}, true);
        expect(integration.createChannel).not.toHaveBeenCalled();
      }
    );

    it('sends a browser that did not answer back to /pair', () => {
      renderContainer(
        integration,
        mockUseFxAStatus({ fxaStatusState: 'unanswered' })
      );

      expect(hardNavigate).toHaveBeenCalledWith('/pair', {}, true);
      expect(integration.createChannel).not.toHaveBeenCalled();
    });

    describe('while the QR is on screen', () => {
      let fxaStatus: jest.SpyInstance;

      beforeEach(() => {
        jest.useFakeTimers();
        fxaStatus = jest.spyOn(firefox, 'fxaStatus');
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      const poll = () =>
        act(() => jest.advanceTimersByTimeAsync(SIGNED_IN_POLL_MS));

      it('asks the browser again and stays while it is signed in', async () => {
        fxaStatus.mockResolvedValue({ signedInUser: MOCK_SIGNED_IN_USER });
        renderContainer();

        await poll();
        await poll();

        expect(fxaStatus).toHaveBeenCalledTimes(2);
        expect(hardNavigate).not.toHaveBeenCalled();
        expect(integration.destroy).not.toHaveBeenCalled();
      });

      it('closes the channel and sends a browser that signed out back to /signin', async () => {
        fxaStatus.mockResolvedValue({ signedInUser: undefined });
        renderContainer();

        await poll();

        expect(integration.destroy).toHaveBeenCalled();
        expect(hardNavigate).toHaveBeenCalledWith('/pair', {}, true);
      });

      it('sends a browser that stopped answering back to /pair', async () => {
        fxaStatus.mockResolvedValue(undefined);
        renderContainer();

        await poll();

        expect(integration.destroy).toHaveBeenCalled();
        expect(hardNavigate).toHaveBeenCalledWith('/pair', {}, true);
      });

      it('stops asking once the page unmounts', async () => {
        fxaStatus.mockResolvedValue({ signedInUser: MOCK_SIGNED_IN_USER });
        const { unmount } = renderContainer();
        unmount();

        await poll();

        expect(fxaStatus).not.toHaveBeenCalled();
      });
    });
  });

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

  it('shows the QR as loading until the channel is created', async () => {
    renderContainer();

    expect(screen.getByTestId('scan-qr-code')).toHaveAttribute(
      'data-loading',
      'true'
    );
    await waitFor(() =>
      expect(screen.getByTestId('scan-qr-code')).toHaveAttribute(
        'data-loading',
        'false'
      )
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

  describe('skip', () => {
    // Waits for the QR to render so the channel is fully set up before the
    // user leaves, as it would be in the browser.
    const skip = async () => {
      const user = userEvent.setup();
      renderContainer();
      await waitFor(() =>
        expect(screen.getByTestId('scan-qr-code')).toHaveAttribute(
          'data-value',
          MOCK_PAIR_URL
        )
      );

      await user.click(screen.getByRole('button', { name: 'Skip for now' }));
    };

    it('records the qr_skip Glean event', async () => {
      await skip();

      expect(mockQrSkip).toHaveBeenCalledTimes(1);
    });

    // Skipping ends the flow, so unlike the other exits from this page the
    // channel does not outlive it.
    it('closes the channel', async () => {
      await skip();

      expect(integration.destroy).toHaveBeenCalledTimes(1);
    });

    // Every pairing promo exits to settings. The pairing query parameters stay
    // behind: nothing in settings reads them.
    it('navigates to settings without the pairing query', async () => {
      await skip();

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });

    // Leaving must not wait on the channel: one that will not close is the
    // integration's problem to report, not a reason to hold the user here.
    it('still navigates and reports to Sentry when the channel will not close', async () => {
      const err = new Error('socket already gone');
      integration.destroy.mockRejectedValue(err);

      await skip();

      expect(mockNavigate).toHaveBeenCalledWith('/settings');
      await waitFor(() => expect(captureException).toHaveBeenCalledWith(err));
    });
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
