/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, act } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import SuppWaitForAuth, { viewName } from '.';
import {
  MOCK_METADATA_UNKNOWN_LOCATION,
  MOCK_METADATA_WITH_DEVICE_NAME,
  MOCK_METADATA_WITH_LOCATION,
} from '../../../components/DeviceInfoBlock/mocks';
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
      onStateChange: ((state: string) => void) | null = null;
      onError: ((err: unknown) => void) | null = null;
      state = SupplicantState.WaitingForAuthority;
      remoteMetadata = null;
      error = null;
    },
  };
});

const mockNavigateWithQuery = jest.fn();
jest.mock('../../../lib/hooks/useNavigateWithQuery', () => ({
  useNavigateWithQuery: () => mockNavigateWithQuery,
}));

describe('SuppWaitForAuth page', () => {
  it('renders as expected when the location is undefined', () => {
    renderWithLocalizationProvider(
      <SuppWaitForAuth authDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION} />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Approval now required from your other device'
    );
    screen.getByText('Firefox on macOS');
    screen.getByText('Location unknown');
    screen.getByText('IP address: XX.XX.XXX.XXX');
  });

  it('renders as expected when a device name is provided', () => {
    renderWithLocalizationProvider(
      <SuppWaitForAuth authDeviceInfo={MOCK_METADATA_WITH_DEVICE_NAME} />
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Ultron'
    );
  });

  it('renders as expected when a location is available', () => {
    renderWithLocalizationProvider(
      <SuppWaitForAuth authDeviceInfo={MOCK_METADATA_WITH_LOCATION} />
    );

    screen.getByText('Vancouver, British Columbia, Canada (estimated)');
  });

  it('emits expected metrics events on render', () => {
    renderWithLocalizationProvider(
      <SuppWaitForAuth authDeviceInfo={MOCK_METADATA_WITH_LOCATION} />
    );

    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  describe('with PairingSupplicantIntegration', () => {
    let mockIntegration: {
      onStateChange: ((state: string) => void) | null;
      onError: ((err: unknown) => void) | null;
      state: string;
      remoteMetadata: unknown;
      error: { message: string } | null;
    };

    beforeEach(() => {
      const { PairingSupplicantIntegration: PSI } = jest.requireMock(
        '../../../models/integrations/pairing-supplicant-integration'
      );
      mockIntegration = new PSI();
      mockNavigateWithQuery.mockClear();
    });

    it('navigates on Complete state change', () => {
      renderWithLocalizationProvider(
        <SuppWaitForAuth
          integration={mockIntegration as unknown as Integration}
        />
      );
      act(() => {
        mockIntegration.onStateChange?.('complete');
      });
      expect(mockNavigateWithQuery).toHaveBeenCalledWith('/oauth/success/');
    });

    it('displays error on Failed state change', () => {
      renderWithLocalizationProvider(
        <SuppWaitForAuth
          integration={mockIntegration as unknown as Integration}
        />
      );
      act(() => {
        mockIntegration.onStateChange?.('failed');
      });
      expect(
        screen.getByText('An error occurred during pairing')
      ).toBeInTheDocument();
    });
  });
});
