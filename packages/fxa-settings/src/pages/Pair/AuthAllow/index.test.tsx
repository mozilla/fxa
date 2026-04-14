/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import AuthAllow from '.';
import {
  MOCK_METADATA_UNKNOWN_LOCATION,
  MOCK_METADATA_WITH_DEVICE_NAME,
  MOCK_METADATA_WITH_LOCATION,
} from '../../../components/DeviceInfoBlock/mocks';
import { MOCK_ACCOUNT, mockAppContext } from '../../../models/mocks';
import { usePageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';
import { Integration } from '../../../models/integrations/integration';
import { AppContext } from '../../../models/contexts/AppContext';
import {
  createHistory,
  createMemorySource,
  LocationProvider,
} from '@reach/router';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../models/integrations/pairing-authority-integration', () => ({
  PairingAuthorityIntegration: class {
    validatePairingClient = jest.fn().mockReturnValue(true);
    getSupplicantMetadata = jest.fn().mockResolvedValue(null);
    authorize = jest.fn();
    channelId = 'test-channel';
  },
}));

const mockNavigateWithQuery = jest.fn();
jest.mock('../../../lib/hooks/useNavigateWithQuery', () => ({
  useNavigateWithQuery: () => mockNavigateWithQuery,
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: { cadApproveDevice: { view: jest.fn(), submit: jest.fn() } },
}));

// Mock getBasicAccountData to return null so TOTP check is skipped
jest.mock('../../../lib/account-storage', () => ({
  getBasicAccountData: jest.fn().mockReturnValue(null),
}));

const MOCK_EMAIL = MOCK_ACCOUNT.primaryEmail.email;

// Helper to render with AppContext (authClient) and LocationProvider (useLocation)
function renderWithAppContext(ui: React.ReactElement) {
  const appCtx = mockAppContext();
  const history = createHistory(createMemorySource('/pair/auth/allow'));
  return renderWithLocalizationProvider(
    <AppContext.Provider value={appCtx}>
      <LocationProvider history={history}>{ui}</LocationProvider>
    </AppContext.Provider>
  );
}

describe('Pair/AuthAllow page', () => {
  // TODO: enable l10n tests when FXA-6461 is resolved (handle embedded tags)
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });
  it('renders as expected when the location is undefined', () => {
    renderWithAppContext(
      <AuthAllow
        email={MOCK_EMAIL}
        suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
      />
    );
    // testAllL10n(screen, bundle, {email:MOCK_EMAIL});

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Did you just sign in to Firefox?'
    );
    expect(screen.getByText('johndope@example.com')).not.toHaveAttribute(
      'href'
    );
    screen.getByText('Firefox on macOS');
    screen.getByText('Location unknown');
    screen.getByText('IP address: XX.XX.XXX.XXX');
    screen.getByRole('button', { name: 'Yes, approve device' });
    expect(
      screen.getByRole('link', { name: 'change your password' })
    ).toHaveAttribute('href', '/settings/change_password');
  });

  it('renders as expected when a device name is provided', () => {
    renderWithAppContext(
      <AuthAllow
        email={MOCK_EMAIL}
        suppDeviceInfo={MOCK_METADATA_WITH_DEVICE_NAME}
      />
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Ultron'
    );
  });

  it('renders as expected when a location is available', () => {
    renderWithAppContext(
      <AuthAllow
        email={MOCK_EMAIL}
        suppDeviceInfo={MOCK_METADATA_WITH_LOCATION}
      />
    );

    screen.getByText('Vancouver, British Columbia, Canada (estimated)');
  });

  it('emits the expected metrics event on render', () => {
    renderWithAppContext(
      <AuthAllow
        email={MOCK_EMAIL}
        suppDeviceInfo={MOCK_METADATA_WITH_DEVICE_NAME}
      />
    );

    expect(usePageViewEvent).toHaveBeenCalledWith(
      'pair.auth.allow',
      REACT_ENTRYPOINT
    );
  });

  describe('with PairingAuthorityIntegration', () => {
    let mockIntegration: {
      validatePairingClient: jest.Mock;
      getSupplicantMetadata: jest.Mock;
      authorize: jest.Mock;
      channelId: string;
    };

    beforeEach(() => {
      const { PairingAuthorityIntegration: PAI } = jest.requireMock(
        '../../../models/integrations/pairing-authority-integration'
      );
      mockIntegration = new PAI();
      mockNavigateWithQuery.mockClear();
    });

    it('calls authorize and navigates on submit', async () => {
      renderWithAppContext(
        <AuthAllow
          email={MOCK_EMAIL}
          suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
          integration={mockIntegration as unknown as Integration}
        />
      );
      fireEvent.click(
        screen.getByRole('button', { name: 'Yes, approve device' })
      );
      await waitFor(() => {
        expect(mockIntegration.authorize).toHaveBeenCalled();
        expect(mockNavigateWithQuery).toHaveBeenCalledWith(
          '/pair/auth/wait_for_supp'
        );
      });
    });

    it('shows error when validatePairingClient fails', () => {
      mockIntegration.validatePairingClient.mockReturnValue(false);
      renderWithAppContext(
        <AuthAllow
          email={MOCK_EMAIL}
          integration={mockIntegration as unknown as Integration}
        />
      );
      expect(screen.getByText('Invalid pairing client')).toBeInTheDocument();
    });

    it('fetches metadata from integration when not provided', async () => {
      mockIntegration.getSupplicantMetadata.mockResolvedValue(
        MOCK_METADATA_UNKNOWN_LOCATION
      );
      renderWithAppContext(
        <AuthAllow
          email={MOCK_EMAIL}
          integration={mockIntegration as unknown as Integration}
        />
      );
      await waitFor(() => {
        expect(screen.getByText('Firefox on macOS')).toBeInTheDocument();
      });
    });
  });
});
