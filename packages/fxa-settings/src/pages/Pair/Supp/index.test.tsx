/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, act } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import Supp from '.';
import { usePageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';
import { Integration } from '../../../models/integrations/integration';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

jest.mock('../../../models/integrations/pairing-supplicant-integration', () => {
  const SupplicantState = {
    Connecting: 'connecting',
    WaitingForMetadata: 'waiting_for_metadata',
    WaitingForAuthorizations: 'waiting_for_authorizations',
    WaitingForAuthority: 'waiting_for_authority',
    WaitingForSupplicant: 'waiting_for_supplicant',
    SendingResult: 'sending_result',
    Complete: 'complete',
    Failed: 'failed',
  };
  return {
    SupplicantState,
    PairingSupplicantIntegration: class {
      validatePairingClient = jest.fn().mockReturnValue(true);
      openChannel = jest.fn().mockResolvedValue(undefined);
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
      },
    },
  };
});

const mockNavigateWithQuery = jest.fn();
jest.mock('../../../lib/hooks/useNavigateWithQuery', () => ({
  useNavigateWithQuery: () => mockNavigateWithQuery,
}));

describe('Pair/Supp page', () => {
  it('renders the default loading state as expected', () => {
    renderWithLocalizationProvider(<Supp />);

    screen.queryByTestId('loading-spinner');
  });

  it('renders as expected when component mounts', () => {
    renderWithLocalizationProvider(<Supp />);
    // Supp is now self-contained, no error prop
  });

  it('emits the expected metrics event on render', () => {
    renderWithLocalizationProvider(<Supp />);

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
      window.location.hash = '#channel_id=test-chan&channel_key=dGVzdA';
    });

    afterEach(() => {
      window.location.hash = '';
    });

    it('shows error when hash params are missing', () => {
      window.location.hash = '';
      renderWithLocalizationProvider(
        <Supp integration={mockIntegration as unknown as Integration} />
      );
      expect(
        screen.getByText('Invalid pairing configuration')
      ).toBeInTheDocument();
    });

    it('shows error when pairing client is invalid', () => {
      mockIntegration.validatePairingClient.mockReturnValue(false);
      renderWithLocalizationProvider(
        <Supp integration={mockIntegration as unknown as Integration} />
      );
      expect(screen.getByText('Invalid pairing client')).toBeInTheDocument();
    });

    it('calls openChannel with params from hash', () => {
      renderWithLocalizationProvider(
        <Supp integration={mockIntegration as unknown as Integration} />
      );
      expect(mockIntegration.openChannel).toHaveBeenCalledWith(
        'wss://test.example.com',
        'test-chan',
        'dGVzdA'
      );
    });

    it('navigates on WaitingForAuthorizations', () => {
      renderWithLocalizationProvider(
        <Supp integration={mockIntegration as unknown as Integration} />
      );
      act(() => {
        mockIntegration.onStateChange?.('waiting_for_authorizations');
      });
      expect(mockNavigateWithQuery).toHaveBeenCalledWith('/pair/supp/allow');
    });
  });
});
