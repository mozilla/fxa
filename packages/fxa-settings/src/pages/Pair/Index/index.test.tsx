/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../../../models/mocks';
import { usePageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';
import GleanMetrics from '../../../lib/glean';
import firefox from '../../../lib/channels/firefox';
import * as ReactUtils from 'fxa-react/lib/utils';
import { MOCK_ERROR } from './mocks';
import { MOCK_CMS_INFO } from '../../mocks';
import Pair, { viewName } from '.';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

let mockLocationState: unknown = null;
const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useLocation: () => ({
    pathname: '/pair',
    search: '',
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
  });

  // Render Pair and wait for the bootstrap spinner to clear before asserting.
  async function renderPair(
    props: React.ComponentProps<typeof Pair> = {}
  ): Promise<void> {
    renderWithRouter(<Pair {...props} />);
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

    it('fires choiceView Glean event on render', async () => {
      await renderPair();
      expect(GleanMetrics.cadFireFox.choiceView).toHaveBeenCalled();
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
    async function renderAndNavigateToDownload(): Promise<void> {
      await renderPair();
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
      'starts an OAuth flow when fxa_status returns %s',
      async (_, response) => {
        requestSignedInUserMock.mockResolvedValueOnce(response);
        renderWithRouter(<Pair />);
        await waitFor(() =>
          expect(fxaOAuthFlowBeginMock).toHaveBeenCalledWith([
            'profile',
            'https://identity.mozilla.com/apps/oldsync',
          ])
        );
      }
    );

    it('hard-navigates to / with the OAuth params Firefox returned', async () => {
      const hardNavigateSpy = jest
        .spyOn(ReactUtils, 'hardNavigate')
        .mockImplementation(() => {});
      try {
        requestSignedInUserMock.mockResolvedValueOnce(undefined);
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
        renderWithRouter(<Pair />);
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
    } as unknown as import('../../../models').Integration;

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
});
