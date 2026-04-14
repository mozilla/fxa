/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, act } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import AuthWaitForSupp, { viewName } from '.';
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

jest.mock('../../../models/integrations/pairing-authority-integration', () => ({
  PairingAuthorityIntegration: class {
    getSupplicantMetadata = jest.fn().mockResolvedValue(null);
    startHeartbeat = jest.fn();
    stopHeartbeat = jest.fn();
    onSuppAuthorized: (() => void) | null = null;
    onHeartbeatError: ((err: unknown) => void) | null = null;
  },
}));

const mockNavigateWithQuery = jest.fn();
jest.mock('../../../lib/hooks/useNavigateWithQuery', () => ({
  useNavigateWithQuery: () => mockNavigateWithQuery,
}));

describe('AuthWaitForSupp page', () => {
  it('renders as expected when the location is undefined', () => {
    renderWithLocalizationProvider(
      <AuthWaitForSupp suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION} />
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
      <AuthWaitForSupp suppDeviceInfo={MOCK_METADATA_WITH_DEVICE_NAME} />
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Ultron'
    );
  });

  it('renders as expected when a location is available', () => {
    renderWithLocalizationProvider(
      <AuthWaitForSupp suppDeviceInfo={MOCK_METADATA_WITH_LOCATION} />
    );

    screen.getByText('Vancouver, British Columbia, Canada (estimated)');
  });

  it('emits expected metrics events on render', () => {
    renderWithLocalizationProvider(
      <AuthWaitForSupp suppDeviceInfo={MOCK_METADATA_WITH_LOCATION} />
    );

    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  describe('with PairingAuthorityIntegration', () => {
    let mockIntegration: {
      getSupplicantMetadata: jest.Mock;
      startHeartbeat: jest.Mock;
      stopHeartbeat: jest.Mock;
      onSuppAuthorized: (() => void) | null;
      onHeartbeatError: ((err: unknown) => void) | null;
    };

    beforeEach(() => {
      const { PairingAuthorityIntegration: PAI } = jest.requireMock(
        '../../../models/integrations/pairing-authority-integration'
      );
      mockIntegration = new PAI();
      mockNavigateWithQuery.mockClear();
    });

    it('starts heartbeat on mount and stops on unmount', () => {
      const { unmount } = renderWithLocalizationProvider(
        <AuthWaitForSupp
          integration={mockIntegration as unknown as Integration}
        />
      );
      expect(mockIntegration.startHeartbeat).toHaveBeenCalled();
      unmount();
      expect(mockIntegration.stopHeartbeat).toHaveBeenCalled();
    });

    it('navigates to /pair/auth/complete on suppAuthorized', () => {
      renderWithLocalizationProvider(
        <AuthWaitForSupp
          integration={mockIntegration as unknown as Integration}
        />
      );
      act(() => {
        mockIntegration.onSuppAuthorized?.();
      });
      expect(mockNavigateWithQuery).toHaveBeenCalledWith('/pair/auth/complete');
    });

    it('navigates to failure page on heartbeatError', () => {
      renderWithLocalizationProvider(
        <AuthWaitForSupp
          integration={mockIntegration as unknown as Integration}
        />
      );
      act(() => {
        mockIntegration.onHeartbeatError?.(new Error('Connection lost'));
      });
      expect(mockNavigateWithQuery).toHaveBeenCalledWith('/pair/failure');
    });
  });
});
