/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { mockAppContext, renderWithRouter } from '../../../models/mocks';
import { usePageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';
import GleanMetrics from '../../../lib/glean';
import firefox from '../../../lib/channels/firefox';
import * as ReactUtils from 'fxa-react/lib/utils';
import { MOCK_ERROR } from './mocks';
import { MOCK_CMS_INFO } from '../../mocks';
import Pair, { viewName } from '.';
import { mockUseFxAStatus } from '../../../lib/hooks/useFxAStatus/mocks';
import { getDefault } from '../../../lib/config';
import { PAIR_GLEAN_REASONS } from 'fxa-shared/metrics/glean/pair-reasons';
import { Integration } from '../../../models';
import { parsePairingHash } from '../../../lib/pairing/pair-url';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

let mockLocationState: unknown = null;
let mockLocationSearch = '';
let mockLocationHash = '';
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useLocation: () => ({
    pathname: '/pair',
    search: mockLocationSearch,
    hash: mockLocationHash,
    state: mockLocationState,
  }),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../lib/channels/firefox', () => ({
  __esModule: true,
  default: {
    send: jest.fn(),
    requestSignedInUser: jest.fn().mockResolvedValue({
      uid: 'sync-uid',
      email: 'sync@example.com',
      sessionToken: 'token',
      verified: true,
    }),
    fxaOAuthFlowBegin: jest.fn().mockResolvedValue(null),
  },
  buildSyncOAuthSearch: jest.requireActual('../../../lib/channels/firefox')
    .buildSyncOAuthSearch,
  FirefoxCommand: {
    PairPreferences: 'fxaccounts:pair_preferences',
  },
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    cadFireFox: {
      choiceView: jest.fn(),
      view: jest.fn(),
      choiceEngage: jest.fn(),
      choiceSubmit: jest.fn(),
      choiceNotnowSubmit: jest.fn(),
      notnowSubmit: jest.fn(),
      syncDeviceSubmit: jest.fn(),
    },
  },
}));

// Stub QRCode so the test can read the encoded URL without decoding an SVG; covered in its own test.
jest.mock('../../../components/QRCode', () => ({
  __esModule: true,
  default: ({
    value,
    localizedLabel,
  }: {
    value: string;
    localizedLabel: string;
  }) => <img alt={localizedLabel} data-testid="pair-qr" data-value={value} />,
}));

// Pair holds a spinner until the browser answers fxa_status, so every render
// needs a settled result.
const defaultProps: React.ComponentProps<typeof Pair> = {
  fxaStatusResult: mockUseFxAStatus(),
};

const sendTabIntegration = {
  data: { entrypoint: 'send-tab-toolbar-icon' },
} as unknown as React.ComponentProps<typeof Pair>['integration'];

const webIntegration = {
  data: { entrypoint: 'fxa_app_menu' },
} as unknown as React.ComponentProps<typeof Pair>['integration'];

describe('Pair', () => {
  // jsdom's default UA lacks "Firefox", which would trip the mount-effect UA check and redirect to /pair/unsupported.
  const realUserAgent = navigator.userAgent;
  beforeAll(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) ' +
        'Gecko/20100101 Firefox/124.0',
      configurable: true,
    });
  });
  afterAll(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: realUserAgent,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockLocationState = null;
    mockLocationSearch = '';
    mockLocationHash = '';
  });

  // Render Pair and wait for the bootstrap spinner to clear before asserting.
  async function renderPair(
    props: Partial<React.ComponentProps<typeof Pair>> = {}
  ): Promise<void> {
    renderWithRouter(<Pair {...defaultProps} {...props} />);
    await screen.findByLabelText(/I already have Firefox for mobile/);
  }

  describe('choice screen', () => {
    it('renders the choice screen by default', async () => {
      await renderPair();
      expect(
        screen.getByText('Sync your Firefox experience')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Select an option to continue:')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/I already have Firefox for mobile/)
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/I don’t have Firefox for mobile/)
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
      expect(
        screen.getByTestId('pair-choice-icon-has-mobile')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('pair-choice-icon-needs-mobile')
      ).toBeInTheDocument();
    });

    // Helper reads the reason actually handed to Glean rather than pinning the
    // whole call shape, so a behaviour-preserving change to how the argument is
    // built doesn't break these.
    const recordedReason = () =>
      (GleanMetrics.cadFireFox.choiceView as jest.Mock).mock.calls[0]?.[0]
        ?.event?.reason;

    it('fires choiceView with no reason when there is no pairReason', async () => {
      await renderPair();
      expect(GleanMetrics.cadFireFox.choiceView).toHaveBeenCalledTimes(1);
      expect(recordedReason()).toBeUndefined();
    });

    it.each(PAIR_GLEAN_REASONS)(
      'fires choiceView with reason %s from location state',
      async (pairReason) => {
        mockLocationState = { pairReason };
        await renderPair();
        expect(recordedReason()).toBe(pairReason);
      }
    );

    // Flows that stop at /signup_confirmed_sync or /inline_recovery_key_setup
    // reach /pair by hard navigation, so the reason arrives as a query param.
    it.each(PAIR_GLEAN_REASONS)(
      'fires choiceView with reason %s from the query param',
      async (pairReason) => {
        mockLocationSearch = `?pairReason=${pairReason}`;
        await renderPair();
        expect(recordedReason()).toBe(pairReason);
      }
    );

    it('prefers location state over the query param', async () => {
      mockLocationState = { pairReason: 'otp_login' };
      mockLocationSearch = '?pairReason=password_login';
      await renderPair();
      expect(recordedReason()).toBe('otp_login');
    });

    it.each(['not-a-real-flow', '<script>alert(1)</script>', ' otp_login'])(
      'ignores the unrecognized query param %j',
      async (pairReason) => {
        mockLocationSearch = `?pairReason=${encodeURIComponent(pairReason)}`;
        await renderPair();
        expect(recordedReason()).toBeUndefined();
      }
    );

    it('ignores an unrecognized value in location state', async () => {
      mockLocationState = { pairReason: 'not-a-real-flow' };
      await renderPair();
      expect(recordedReason()).toBeUndefined();
    });

    it('enables Continue button after selecting a radio', async () => {
      await renderPair();
      fireEvent.click(
        screen.getByLabelText(/I already have Firefox for mobile/)
      );
      expect(
        screen.getByRole('button', { name: 'Continue' })
      ).not.toBeDisabled();
    });

    it('fires choiceEngage with "has mobile" reason', async () => {
      await renderPair();
      fireEvent.click(
        screen.getByLabelText(/I already have Firefox for mobile/)
      );
      expect(GleanMetrics.cadFireFox.choiceEngage).toHaveBeenCalledWith({
        event: { reason: 'has mobile' },
      });
    });

    it('fires choiceEngage with "does not have mobile" reason', async () => {
      await renderPair();
      fireEvent.click(screen.getByLabelText(/I don’t have Firefox for mobile/));
      expect(GleanMetrics.cadFireFox.choiceEngage).toHaveBeenCalledWith({
        event: { reason: 'does not have mobile' },
      });
    });

    it('sends pair_preferences when "has mobile" is selected and Continue is clicked', async () => {
      await renderPair();
      fireEvent.click(
        screen.getByLabelText(/I already have Firefox for mobile/)
      );
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
      expect(GleanMetrics.cadFireFox.choiceSubmit).toHaveBeenCalledWith({
        event: { reason: 'has mobile' },
      });
      expect(firefox.send).toHaveBeenCalledWith(
        'fxaccounts:pair_preferences',
        {}
      );
    });

    it('transitions to download screen when "needs mobile" is selected and Continue is clicked', async () => {
      await renderPair();
      fireEvent.click(screen.getByLabelText(/I don’t have Firefox for mobile/));
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
      expect(GleanMetrics.cadFireFox.choiceSubmit).toHaveBeenCalledWith({
        event: { reason: 'does not have mobile' },
      });
      expect(
        screen.getByText('Download Firefox for mobile')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Continue to sync' })
      ).toBeInTheDocument();
    });

    it('fires choiceNotnowSubmit when "Not now" is clicked on choice screen', async () => {
      await renderPair();
      fireEvent.click(screen.getByText('Not now'));
      expect(GleanMetrics.cadFireFox.choiceNotnowSubmit).toHaveBeenCalled();
    });
  });

  describe('download screen', () => {
    async function renderAndNavigateToDownload(
      props: Partial<React.ComponentProps<typeof Pair>> = {}
    ): Promise<void> {
      await renderPair(props);
      fireEvent.click(screen.getByLabelText(/I don’t have Firefox for mobile/));
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    }

    it('renders download screen with QR code and instructions', async () => {
      await renderAndNavigateToDownload();
      expect(
        screen.getByText('Download Firefox for mobile')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/To sync Firefox on your phone or tablet/)
      ).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'QR code' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Continue to sync' })
      ).toBeInTheDocument();
    });

    it('encodes the send-tab Mozilla download link in the QR for a send-tab entrypoint', async () => {
      await renderAndNavigateToDownload({ integration: sendTabIntegration });
      expect(screen.getByTestId('pair-qr').getAttribute('data-value')).toBe(
        'https://mzl.la/4vr1mWU'
      );
    });

    it('encodes the generic Mozilla download link for a non-send-tab entrypoint', async () => {
      await renderAndNavigateToDownload({ integration: webIntegration });
      expect(screen.getByTestId('pair-qr').getAttribute('data-value')).toBe(
        'https://mzl.la/4vbFJda'
      );
    });

    it('fires view Glean event when download screen renders', async () => {
      await renderAndNavigateToDownload();
      expect(GleanMetrics.cadFireFox.view).toHaveBeenCalled();
    });

    it('sends pair_preferences on "Continue to sync"', async () => {
      await renderAndNavigateToDownload();
      fireEvent.click(screen.getByRole('button', { name: 'Continue to sync' }));
      expect(GleanMetrics.cadFireFox.syncDeviceSubmit).toHaveBeenCalled();
      expect(firefox.send).toHaveBeenCalledWith(
        'fxaccounts:pair_preferences',
        {}
      );
    });

    it('fires notnowSubmit when "Not now" is clicked on download screen', async () => {
      await renderAndNavigateToDownload();
      fireEvent.click(screen.getByText('Not now'));
      expect(GleanMetrics.cadFireFox.notnowSubmit).toHaveBeenCalled();
    });

    it('navigates back to choice screen on back button', async () => {
      await renderAndNavigateToDownload();
      const backButton = screen.getByTitle('Back');
      fireEvent.click(backButton);
      await waitFor(() => {
        expect(
          screen.getByText('Select an option to continue:')
        ).toBeInTheDocument();
      });
    });
  });

  describe('general', () => {
    it('renders any arising errors on choice screen', async () => {
      await renderPair({ error: MOCK_ERROR });
      expect(screen.getByText(MOCK_ERROR)).toBeInTheDocument();
    });

    it('emits expected page view metric on render', async () => {
      await renderPair();
      expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
    });
  });

  describe('sync bootstrap on mount', () => {
    const requestSignedInUserMock = jest.mocked(firefox.requestSignedInUser);
    const fxaOAuthFlowBeginMock = jest.mocked(firefox.fxaOAuthFlowBegin);

    it('renders the choice screen when Firefox has a verified Sync user', async () => {
      await renderPair();
      expect(requestSignedInUserMock).toHaveBeenCalledWith(
        'oauth',
        true,
        'sync'
      );
      expect(fxaOAuthFlowBeginMock).not.toHaveBeenCalled();
    });

    it.each([
      ['no SignedInUser', undefined],
      [
        'SignedInUser missing sessionToken',
        {
          uid: 'sync-uid',
          email: 'sync@example.com',
          sessionToken: undefined,
          verified: true,
        },
      ],
      [
        'SignedInUser is unverified',
        {
          uid: 'sync-uid',
          email: 'sync@example.com',
          sessionToken: 'token',
          verified: false,
        },
      ],
    ])(
      'starts an OAuth flow when fxa_status returns %s on every attempt',
      async (_, response) => {
        requestSignedInUserMock.mockResolvedValue(response);
        renderWithRouter(<Pair {...defaultProps} />);
        await waitFor(() =>
          expect(fxaOAuthFlowBeginMock).toHaveBeenCalledWith([
            'profile',
            'https://identity.mozilla.com/apps/oldsync',
          ])
        );
      }
    );

    it('retries fxa_status once when the first reply is empty, then reveals on success', async () => {
      requestSignedInUserMock
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({
          uid: 'sync-uid',
          email: 'sync@example.com',
          sessionToken: 'token',
          verified: true,
        });
      await renderPair();
      expect(requestSignedInUserMock).toHaveBeenCalledTimes(2);
      expect(fxaOAuthFlowBeginMock).not.toHaveBeenCalled();
    });

    it('caps fxa_status at two asks before falling through to OAuth', async () => {
      requestSignedInUserMock.mockResolvedValue(undefined);
      renderWithRouter(<Pair {...defaultProps} />);
      await waitFor(() => expect(fxaOAuthFlowBeginMock).toHaveBeenCalled());
      expect(requestSignedInUserMock).toHaveBeenCalledTimes(2);
    });

    it('hard-navigates to / with the OAuth params Firefox returned', async () => {
      const hardNavigateSpy = jest
        .spyOn(ReactUtils, 'hardNavigate')
        .mockImplementation(() => {});
      try {
        requestSignedInUserMock.mockResolvedValue(undefined);
        fxaOAuthFlowBeginMock.mockResolvedValueOnce({
          action: 'signin',
          response_type: 'code',
          access_type: 'offline',
          scope: 'profile https://identity.mozilla.com/apps/oldsync',
          client_id: 'cid-abc',
          state: 'state-xyz',
          code_challenge: 'cc',
          code_challenge_method: 'S256',
        });
        renderWithRouter(<Pair {...defaultProps} />);
        await waitFor(() => expect(hardNavigateSpy).toHaveBeenCalled());
        const [target] = hardNavigateSpy.mock.calls[0];
        const url = new URL(target, 'http://localhost');
        expect(url.pathname).toBe('/');
        expect(Object.fromEntries(url.searchParams)).toEqual({
          context: 'oauth_webchannel_v1',
          service: 'sync',
          client_id: 'cid-abc',
          state: 'state-xyz',
          scope: 'profile https://identity.mozilla.com/apps/oldsync',
          access_type: 'offline',
          response_type: 'code',
          action: 'signin',
          code_challenge: 'cc',
          code_challenge_method: 'S256',
        });
      } finally {
        hardNavigateSpy.mockRestore();
      }
    });

    it('reveals the choice screen when WebChannel never replies', async () => {
      requestSignedInUserMock.mockResolvedValueOnce(undefined);
      fxaOAuthFlowBeginMock.mockResolvedValueOnce(null);
      await renderPair();
      expect(
        screen.getByLabelText(/I already have Firefox for mobile/)
      ).toBeInTheDocument();
    });

    it('reveals the choice screen when fxa_status throws and OAuth never replies', async () => {
      requestSignedInUserMock.mockRejectedValueOnce(new Error('boom'));
      fxaOAuthFlowBeginMock.mockResolvedValueOnce(null);
      await renderPair();
      expect(
        screen.getByLabelText(/I already have Firefox for mobile/)
      ).toBeInTheDocument();
    });
  });

  describe('success banner from location state', () => {
    it('renders the signed-in banner for origin=signin', async () => {
      mockLocationState = { origin: 'signin' };
      await renderPair();
      expect(screen.getByText('Signed in successfully!')).toBeInTheDocument();
    });

    it('renders the signup banner for origin=signup', async () => {
      mockLocationState = { origin: 'signup' };
      await renderPair();
      expect(
        screen.getByText('Account created. You’re now syncing.')
      ).toBeInTheDocument();
    });

    it('renders the password-created banner for origin=post-verify-set-password', async () => {
      mockLocationState = { origin: 'post-verify-set-password' };
      await renderPair();
      expect(
        screen.getByText('Password created. You’re now syncing.')
      ).toBeInTheDocument();
    });

    it('does not render a banner when origin is absent', async () => {
      mockLocationState = null;
      await renderPair();
      expect(
        screen.queryByText('Signed in successfully!')
      ).not.toBeInTheDocument();
    });

    it('does not render the banner on the download screen', async () => {
      mockLocationState = { origin: 'signin' };
      await renderPair();
      fireEvent.click(screen.getByLabelText(/I don’t have Firefox for mobile/));
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
      expect(
        screen.queryByText('Signed in successfully!')
      ).not.toBeInTheDocument();
    });
  });

  describe('Send Tab variant', () => {
    const sendTabIntegration = {
      data: { entrypoint: 'send-tab-toolbar-icon' },
    } as unknown as Integration;

    it('renders the send-tab heading without the grey "Connect another device" text', async () => {
      await renderPair({ integration: sendTabIntegration });
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /Download or open Firefox on the device where you want to send tabs/,
        })
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Connect another device')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Sync your Firefox experience')
      ).not.toBeInTheDocument();
    });

    it('omits the "View your saved passwords…" description', async () => {
      await renderPair({ integration: sendTabIntegration });
      expect(
        screen.queryByText(/View your saved passwords/)
      ).not.toBeInTheDocument();
    });
  });

  describe('CMS theming', () => {
    it('renders the choice screen Continue button with CMS button color', async () => {
      await renderPair({ cmsInfo: MOCK_CMS_INFO });
      const continueBtn = screen.getByRole('button', { name: 'Continue' });
      expect(continueBtn).toHaveClass('cta-primary-cms');
      // CmsButtonWithFallback sets --cta-bg as an inline CSS variable.
      expect(continueBtn.style.getPropertyValue('--cta-bg')).toBe(
        MOCK_CMS_INFO.shared.buttonColor
      );
    });

    it('renders the download screen Continue to sync button with CMS button color', async () => {
      await renderPair({ cmsInfo: MOCK_CMS_INFO });
      // Navigate from choice → download by selecting "needs mobile" + Continue
      fireEvent.click(screen.getByLabelText(/I don’t have Firefox for mobile/));
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
      const continueToSyncBtn = screen.getByRole('button', {
        name: 'Continue to sync',
      });
      expect(continueToSyncBtn).toHaveClass('cta-primary-cms');
      expect(continueToSyncBtn.style.getPropertyValue('--cta-bg')).toBe(
        MOCK_CMS_INFO.shared.buttonColor
      );
    });

    it('renders the CMS header logo from cmsInfo.shared.headerLogoUrl', async () => {
      await renderPair({ cmsInfo: MOCK_CMS_INFO });
      const logo = screen.getByAltText(MOCK_CMS_INFO.shared.headerLogoAltText);
      expect(logo).toHaveAttribute('src', MOCK_CMS_INFO.shared.headerLogoUrl);
    });

    it('falls back to the default Continue button when no cmsInfo is provided', async () => {
      await renderPair();
      const continueBtn = screen.getByRole('button', { name: 'Continue' });
      expect(continueBtn).toHaveClass('cta-primary');
      expect(continueBtn).not.toHaveClass('cta-primary-cms');
      expect(continueBtn.style.getPropertyValue('--cta-bg')).toBe('');
    });
  });

  // A supplicant that scanned the authority's QR lands on /pair with the
  // channel in the hash, and belongs in the v2 supplicant flow rather than on
  // this desktop-only choice screen.
  describe('pairing v2 supplicant hand-off', () => {
    const V2_HASH = '#channel_id=chan-1&channel_key=key-1&v=2';
    const v2Props = {
      fxaStatusResult: mockUseFxAStatus({
        pairingEnabled: true,
        pairingVersion: 2,
      }),
    };
    // v2 routing is gated on the deployment config as well as the browser, so
    // the suite has to opt in on both sides.
    const v2AppContext = () => {
      const config = getDefault();
      config.pairing.version = 2;
      return mockAppContext({ config } as Parameters<typeof mockAppContext>[0]);
    };

    it('hands the channel to the supplicant flow, dropping the hash', async () => {
      mockLocationHash = V2_HASH;
      renderWithRouter(<Pair {...v2Props} />, {}, v2AppContext());

      await waitFor(() =>
        // No hash on the destination: the channel key is the pairing PSK, and
        // it travels in router state instead.
        expect(mockNavigate).toHaveBeenCalledWith(
          '/pair/supplicant/connect_this_device',
          { state: { channelId: 'chan-1', channelKey: 'key-1', version: '2' } }
        )
      );
    });

    it('does not send the browser to /pair/unsupported while handing off', async () => {
      mockLocationHash = V2_HASH;
      renderWithRouter(<Pair {...v2Props} />, {}, v2AppContext());

      await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
      expect(mockNavigate).not.toHaveBeenCalledWith(
        '/pair/unsupported',
        expect.anything()
      );
      expect(mockNavigate).not.toHaveBeenCalledWith('/pair/unsupported');
    });

    // Only desktop can be the authority, and it reaches /pair without a
    // channel because it is the side that mints one.
    it('reloads into the QR scanner when the hash carries no pairing channel', async () => {
      // A hard navigate rather than a router hop: `useIntegration` is not keyed
      // on location, so the authority integration only exists after a reload.
      const hardNavigateSpy = jest
        .spyOn(ReactUtils, 'hardNavigate')
        .mockImplementation(() => {});
      renderWithRouter(<Pair {...v2Props} />, {}, v2AppContext());

      await waitFor(() =>
        expect(hardNavigateSpy).toHaveBeenCalledWith(
          '/pair/authority/scan_qr',
          {},
          true
        )
      );
      expect(mockNavigate).not.toHaveBeenCalledWith(
        '/pair/supplicant/connect_this_device',
        expect.anything()
      );
      hardNavigateSpy.mockRestore();
    });

    it('falls through to the normal flow when the browser reports v1', async () => {
      const status = { pairingEnabled: true, pairingVersion: 1 };
      mockLocationHash = V2_HASH;
      renderWithRouter(
        <Pair fxaStatusResult={mockUseFxAStatus(status)} />,
        {},
        v2AppContext()
      );

      // The desktop UA is stubbed for this suite, so the bootstrap reaching the
      // choice screen is what proves the hold expired. Waits past the grace
      // period, which is longer than the default findBy timeout.
      await screen.findByLabelText(/I already have Firefox for mobile/, undefined, {
        timeout: 4000,
      });
      expect(mockNavigate).not.toHaveBeenCalledWith(
        '/pair/supplicant/connect_this_device',
        expect.anything()
      );
    });


  });
});

describe('parseV2PairingHash', () => {
  it('reads the channel out of an authority QR hash', () => {
    expect(
      parsePairingHash('#channel_id=chan-1&channel_key=key-1&v=2')
    ).toEqual({ channelId: 'chan-1', channelKey: 'key-1', version: '2' });
  });

  it('accepts a hash without the leading #', () => {
    expect(parsePairingHash('channel_id=chan-1&channel_key=key-1&v=2')).toEqual(
      { channelId: 'chan-1', channelKey: 'key-1', version: '2' }
    );
  });

  it.each([
    ['an empty hash', ''],
    ['an absent hash', undefined],
    ['no version', '#channel_id=chan-1&channel_key=key-1'],
    ['version 1', '#channel_id=chan-1&channel_key=key-1&v=1'],
    // Half a channel cannot be opened, so it is no hand-off rather than a
    // broken one.
    ['no channel_key', '#channel_id=chan-1&v=2'],
    ['no channel_id', '#channel_key=key-1&v=2'],
    ['an empty channel_key', '#channel_id=chan-1&channel_key=&v=2'],
  ])('returns undefined for %s', (_label, hash) => {
    expect(parsePairingHash(hash)).toBeUndefined();
  });

  // A phone that scans the pairing QR with its system camera opens this page in
  // its default browser, which is often not Firefox. Those browsers never answer
  // fxa_status, so the page hands the pairing URL to the Firefox app instead of
  // dead-ending on /pair/unsupported.
  describe('hand-off when the browser never answers fxa_status', () => {
    const V2_HASH = '#channel_id=chan-1&channel_key=key-1&v=2';
    const IOS_SAFARI =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 ' +
      '(KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
    const ANDROID_CHROME =
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/124.0.0.0 Mobile Safari/537.36';
    const DESKTOP_CHROME =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
    const FIREFOX_ANDROID =
      'Mozilla/5.0 (Android 14; Mobile; rv:124.0) Gecko/124.0 Firefox/124.0';

    const setUserAgent = (value: string) =>
      Object.defineProperty(navigator, 'userAgent', {
        value,
        configurable: true,
      });

    const unansweredProps = {
      fxaStatusResult: mockUseFxAStatus({ fxaStatusState: 'unanswered' }),
    };

    const v2AppContext = () => {
      const config = getDefault();
      config.pairing.version = 2;
      return mockAppContext({ config } as Parameters<typeof mockAppContext>[0]);
    };

    beforeEach(() => {
      mockLocationHash = V2_HASH;
    });

    it.each([
      ['iOS Safari', IOS_SAFARI],
      ['Android Chrome', ANDROID_CHROME],
    ])('offers to continue in Firefox on %s', async (_label, ua) => {
      setUserAgent(ua);
      renderWithRouter(<Pair {...unansweredProps} />, {}, v2AppContext());

      expect(
        await screen.findByRole('heading', { name: 'Continue in Firefox' })
      ).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    // The channel key is what the deep link exists to carry; without it Firefox
    // opens on a /pair page with nothing to pair.
    it('hands Firefox the pairing URL the QR encoded', async () => {
      setUserAgent(IOS_SAFARI);
      renderWithRouter(<Pair {...unansweredProps} />, {}, v2AppContext());

      const cta = await screen.findByRole('link', {
        name: 'Continue in Firefox',
      });
      const target = new URL(
        decodeURIComponent(
          cta.getAttribute('href')!.replace('firefox://open-url?url=', '')
        )
      );
      expect(target.pathname).toBe('/pair');
      expect(target.hash).toBe(V2_HASH);
    });

    // There is no Firefox app to hand off to on desktop.
    it('sends a non-Firefox desktop browser to /pair/unsupported', async () => {
      setUserAgent(DESKTOP_CHROME);
      renderWithRouter(<Pair {...unansweredProps} />, {}, v2AppContext());

      // The hash rides along, which is what lets /pair/unsupported recognise a
      // system-camera scan.
      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith(`/pair/unsupported${V2_HASH}`)
      );
      expect(
        screen.queryByRole('heading', { name: 'Continue in Firefox' })
      ).not.toBeInTheDocument();
    });

    // firefox:// inside Firefox is a no-op, so a hand-off here would strand the
    // user rather than help them.
    it('does not offer the hand-off inside Firefox for Android', async () => {
      setUserAgent(FIREFOX_ANDROID);
      renderWithRouter(<Pair {...unansweredProps} />, {}, v2AppContext());

      await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
      expect(
        screen.queryByRole('heading', { name: 'Continue in Firefox' })
      ).not.toBeInTheDocument();
    });

    it('does not offer the hand-off when the URL carries no pairing channel', async () => {
      mockLocationHash = '';
      setUserAgent(IOS_SAFARI);
      renderWithRouter(<Pair {...unansweredProps} />, {}, v2AppContext());

      await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
      expect(
        screen.queryByRole('heading', { name: 'Continue in Firefox' })
      ).not.toBeInTheDocument();
    });

    // A browser that answered is telling us something; only silence means the
    // WebChannel is absent.
    it('does not offer the hand-off when the browser answered with v1', async () => {
      setUserAgent(IOS_SAFARI);
      renderWithRouter(
        <Pair fxaStatusResult={mockUseFxAStatus({ pairingVersion: 1 })} />,
        {},
        v2AppContext()
      );

      await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
      expect(
        screen.queryByRole('heading', { name: 'Continue in Firefox' })
      ).not.toBeInTheDocument();
    });
  });
});
