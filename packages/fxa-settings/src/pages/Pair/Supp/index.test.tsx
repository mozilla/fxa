/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, act } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import Supp from '.';
import { usePageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';
import { Integration } from '../../../models/integrations/integration';
import { mockUseFxAStatus } from '../../../lib/hooks/useFxAStatus/mocks';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

jest.mock('../../../models/integrations/pairing-supplicant-integration', () => {
  const { MOCK_SUPPLICANT_STATE: SupplicantState } = jest.requireActual(
    '../__mocks__/pairing-test-helpers'
  );
  const PAIR_COMPLETE_STORAGE_PREFIX = 'fxa.pair.complete.';
  return {
    SupplicantState,
    PAIR_COMPLETE_STORAGE_PREFIX,
    isChannelComplete: (channelId: string) => {
      try {
        return (
          globalThis.sessionStorage.getItem(
            PAIR_COMPLETE_STORAGE_PREFIX + channelId
          ) === '1'
        );
      } catch {
        return false;
      }
    },
    clearChannelComplete: (channelId: string) => {
      try {
        globalThis.sessionStorage.removeItem(
          PAIR_COMPLETE_STORAGE_PREFIX + channelId
        );
      } catch {
        // ignore
      }
    },
    PairingSupplicantIntegration: class {
      validatePairingClient = jest.fn().mockReturnValue(true);
      openChannel = jest.fn().mockResolvedValue(undefined);
      getClientId = jest.fn().mockReturnValue('test-client');
      onStateChange: ((state: string) => void) | null = null;
      onError: ((err: unknown) => void) | null = null;
      state = SupplicantState.Connecting;
      error = null;
    },
  };
});

jest.mock('../../../lib/config', () => {
  const actual = jest.requireActual('../../../lib/config');
  return {
    ...actual,
    __esModule: true,
    default: {
      ...actual.default,
      pairing: {
        serverBaseUri: 'wss://test.example.com',
        clients: [],
        version: 1,
      },
    },
  };
});

const mockConfig = jest.requireMock('../../../lib/config').default;

const mockNavigateWithQuery = jest.fn();
jest.mock('../../../lib/hooks/useNavigateWithQuery', () => ({
  useNavigateWithQuery: () => mockNavigateWithQuery,
}));

describe('Pair/Supp page', () => {
  it('renders the default loading state as expected', () => {
    renderWithLocalizationProvider(
      <Supp fxaStatusResult={mockUseFxAStatus()} />
    );

    screen.queryByTestId('loading-spinner');
  });

  it('renders as expected when component mounts', () => {
    renderWithLocalizationProvider(
      <Supp fxaStatusResult={mockUseFxAStatus()} />
    );
    // Supp is now self-contained, no error prop
  });

  it('emits the expected metrics event on render', () => {
    renderWithLocalizationProvider(
      <Supp fxaStatusResult={mockUseFxAStatus()} />
    );

    expect(usePageViewEvent).toHaveBeenCalledWith(
      'pair.supp',
      REACT_ENTRYPOINT
    );
  });

  describe('with PairingSupplicantIntegration', () => {
    let mockIntegration: {
      validatePairingClient: jest.Mock;
      openChannel: jest.Mock;
      onStateChange: ((state: string) => void) | null;
      onError: ((err: unknown) => void) | null;
      state: string;
      error: { message: string } | null;
    };

    beforeEach(() => {
      const { PairingSupplicantIntegration: PSI } = jest.requireMock(
        '../../../models/integrations/pairing-supplicant-integration'
      );
      mockIntegration = new PSI();
      mockNavigateWithQuery.mockClear();
      sessionStorage.clear();
      mockConfig.pairing.version = 1;
      window.location.hash = '#channel_id=test-chan&channel_key=dGVzdA';
    });

    afterEach(() => {
      window.location.hash = '';
      sessionStorage.clear();
    });

    // Defaults to a browser that answered fxa_status reporting v1 pairing.
    const renderSupp = (fxaStatusResult = mockUseFxAStatus()) =>
      renderWithLocalizationProvider(
        <Supp
          integration={mockIntegration as unknown as Integration}
          {...{ fxaStatusResult }}
        />
      );

    // The v1 flow's signature: this page opens the channel itself and stays put.
    const expectV1Flow = () => {
      expect(mockIntegration.openChannel).toHaveBeenCalledWith(
        'wss://test.example.com',
        'test-chan',
        'dGVzdA'
      );
      expect(mockNavigateWithQuery).not.toHaveBeenCalled();
    };

    it('shows error when hash params are missing', () => {
      window.location.hash = '';
      renderSupp();
      expect(
        screen.getByText('Invalid pairing configuration')
      ).toBeInTheDocument();
    });

    it('shows error when pairing client is invalid', () => {
      mockIntegration.validatePairingClient.mockReturnValue(false);
      renderSupp();
      expect(screen.getByText('Invalid pairing client')).toBeInTheDocument();
    });

    it('calls openChannel with params from hash', () => {
      renderSupp();
      expect(mockIntegration.openChannel).toHaveBeenCalledWith(
        'wss://test.example.com',
        'test-chan',
        'dGVzdA'
      );
    });

    it('navigates on WaitingForAuthorizations', () => {
      renderSupp();
      act(() => {
        mockIntegration.onStateChange?.('waiting_for_authorizations');
      });
      expect(mockNavigateWithQuery).toHaveBeenCalledWith('/pair/supp/allow');
    });

    it('redirects to success when completion marker is set for this channel', () => {
      sessionStorage.setItem('fxa.pair.complete.test-chan', '1');
      renderSupp();
      expect(mockIntegration.openChannel).not.toHaveBeenCalled();
      expect(mockNavigateWithQuery).toHaveBeenCalledWith(
        '/oauth/success/test-client'
      );
      expect(sessionStorage.getItem('fxa.pair.complete.test-chan')).toBeNull();
    });

    it('ignores completion marker for a different channel', () => {
      sessionStorage.setItem('fxa.pair.complete.other-chan', '1');
      renderSupp();
      expect(mockIntegration.openChannel).toHaveBeenCalled();
      expect(mockNavigateWithQuery).not.toHaveBeenCalled();
    });

    it('runs the v1 flow when the fragment has no version', () => {
      mockConfig.pairing.version = 2;
      renderSupp(mockUseFxAStatus({ pairingVersion: 2 }));
      expectV1Flow();
    });

    // An app that scanned the QR with its own camera opens this page with the
    // authority's fragment copied over, so a v2 authority's `v=2` arrives here.
    describe('with a v2 fragment', () => {
      // A browser that answered fxa_status reporting v2 pairing support.
      const v2Browser = mockUseFxAStatus({ pairingVersion: 2 });

      beforeEach(() => {
        window.location.hash = '#channel_id=test-chan&channel_key=dGVzdA&v=2';
        mockConfig.pairing.version = 2;
      });

      it('hands off to the v2 supplicant flow, without the hash', () => {
        renderSupp(v2Browser);
        expect(mockNavigateWithQuery).toHaveBeenCalledWith(
          '/pair/supplicant/connect_this_device',
          {
            state: {
              channelId: 'test-chan',
              channelKey: 'dGVzdA',
              version: '2',
            },
          },
          false
        );
      });

      it('leaves the channel for the v2 flow to open', () => {
        renderSupp(v2Browser);
        expect(mockIntegration.openChannel).not.toHaveBeenCalled();
      });

      it('redirects to the v2 success screen when the channel is complete', () => {
        sessionStorage.setItem('fxa.pair.complete.test-chan', '1');
        renderSupp(v2Browser);
        expect(mockNavigateWithQuery).toHaveBeenCalledWith(
          '/pair/supplicant/sync_success',
          {},
          false
        );
        expect(
          sessionStorage.getItem('fxa.pair.complete.test-chan')
        ).toBeNull();
      });

      it('runs the v1 flow when the browser does not report v2 pairing', () => {
        renderSupp(mockUseFxAStatus({ pairingVersion: 1 }));
        expectV1Flow();
      });

      it('runs the v1 flow when the browser never answered fxa_status', () => {
        renderSupp(
          mockUseFxAStatus({ fxaStatusState: 'unanswered', pairingVersion: 1 })
        );
        expectV1Flow();
      });

      it('chooses no flow while fxa_status is still pending', () => {
        renderSupp(
          mockUseFxAStatus({ fxaStatusState: 'pending', pairingVersion: 2 })
        );
        expect(mockIntegration.openChannel).not.toHaveBeenCalled();
        expect(mockNavigateWithQuery).not.toHaveBeenCalled();
      });

      it('runs the v1 flow when FxA has v2 disabled', () => {
        mockConfig.pairing.version = 1;
        renderSupp(v2Browser);
        expectV1Flow();
      });
    });
  });
});
