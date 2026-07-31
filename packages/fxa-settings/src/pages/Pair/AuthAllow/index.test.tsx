/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import AuthAllow from '.';
import {
  MOCK_METADATA_UNKNOWN_LOCATION,
  MOCK_METADATA_WITH_DEVICE_NAME,
  MOCK_METADATA_WITH_LOCATION,
} from '../../../components/DeviceInfoBlock/mocks';
import { MOCK_AUTHORITY_ACCOUNT } from '../mocks';
import { MOCK_ACCOUNT, mockAppContext } from '../../../models/mocks';
import { usePageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';
import { Integration } from '../../../models/integrations/integration';
import { AppContext } from '../../../models/contexts/AppContext';
import { firefox } from '../../../lib/channels/firefox';
import {
  markPairingTotpVerified,
  resetPairingTotpVerified,
} from '../../../lib/pairing-authority';
import { MemoryRouter } from 'react-router';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
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

// The browser, not web storage, is the source of the account being paired.
jest.mock('../../../lib/channels/firefox', () => ({
  firefox: {
    requestSignedInUser: jest.fn(),
    pairAuthorize: jest.fn().mockResolvedValue(undefined),
  },
}));
const mockRequestSignedInUser = firefox.requestSignedInUser as jest.Mock;

const MOCK_CHANNEL_ID = '1c2d3e4f5a6b7c8d';
const MOCK_EMAIL = MOCK_ACCOUNT.primaryEmail.email;
const APPROVE_BUTTON = { name: 'Yes, approve device' };

/** accountProfile response for an account with no second factor configured. */
const mockProfileWithoutTotp = () =>
  jest.fn().mockResolvedValue({ authenticationMethods: ['pwd', 'email'] });

/** accountProfile response for an account with TOTP verified and enabled. */
const mockProfileWithTotp = () =>
  jest
    .fn()
    .mockResolvedValue({ authenticationMethods: ['pwd', 'email', 'otp'] });

// Helper to render with AppContext (authClient) and MemoryRouter (useLocation)
function renderWithAppContext(
  ui: React.ReactElement,
  authClientOverrides: Partial<{
    accountProfile: jest.Mock;
  }> = {}
) {
  const appCtx = mockAppContext();
  if (appCtx.authClient) {
    Object.assign(appCtx.authClient as object, {
      accountProfile: mockProfileWithoutTotp(),
      ...authClientOverrides,
    });
  }
  return renderWithLocalizationProvider(
    <AppContext.Provider value={appCtx}>
      <MemoryRouter initialEntries={['/pair/auth/allow']}>{ui}</MemoryRouter>
    </AppContext.Provider>
  );
}

describe('Pair/AuthAllow page', () => {
  // TODO: enable l10n tests when FXA-6461 is resolved (handle embedded tags)
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  beforeEach(() => {
    jest.clearAllMocks();
    resetPairingTotpVerified();
    mockRequestSignedInUser.mockResolvedValue(MOCK_AUTHORITY_ACCOUNT);
    window.history.pushState(
      {},
      '',
      `/pair/auth/allow?channel_id=${MOCK_CHANNEL_ID}`
    );
  });

  it('renders as expected when the location is undefined', async () => {
    renderWithAppContext(
      <AuthAllow
        email={MOCK_EMAIL}
        suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
      />
    );
    // testAllL10n(screen, bundle, {email:MOCK_EMAIL});

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'Did you just sign in to Firefox?'
    );
    expect(screen.getByText('johndope@example.com')).not.toHaveAttribute(
      'href'
    );
    screen.getByText('Firefox on macOS');
    screen.getByText('Location unknown');
    screen.getByText('IP address: XX.XX.XXX.XXX');
    screen.getByRole('button', APPROVE_BUTTON);
    expect(
      screen.getByRole('link', { name: 'change your password' })
    ).toHaveAttribute('href', '/settings/change_password');
  });

  it('renders as expected when a device name is provided', async () => {
    renderWithAppContext(
      <AuthAllow
        email={MOCK_EMAIL}
        suppDeviceInfo={MOCK_METADATA_WITH_DEVICE_NAME}
      />
    );

    expect(await screen.findByRole('heading', { level: 2 })).toHaveTextContent(
      'Ultron'
    );
  });

  it('renders as expected when a location is available', async () => {
    renderWithAppContext(
      <AuthAllow
        email={MOCK_EMAIL}
        suppDeviceInfo={MOCK_METADATA_WITH_LOCATION}
      />
    );

    expect(
      await screen.findByText('Vancouver, British Columbia, Canada (estimated)')
    ).toBeInTheDocument();
  });

  it('shows the email of the account the browser is signed in to', async () => {
    renderWithAppContext(
      <AuthAllow
        email="stale-url-param@example.com"
        suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
      />
    );

    expect(
      await screen.findByText(MOCK_AUTHORITY_ACCOUNT.email)
    ).toBeInTheDocument();
    expect(
      screen.queryByText('stale-url-param@example.com')
    ).not.toBeInTheDocument();
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
    });

    it('calls authorize and navigates on submit', async () => {
      const user = userEvent.setup();
      renderWithAppContext(
        <AuthAllow
          email={MOCK_EMAIL}
          suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
          integration={mockIntegration as unknown as Integration}
        />
      );

      await user.click(await screen.findByRole('button', APPROVE_BUTTON));

      await waitFor(() => {
        expect(mockIntegration.authorize).toHaveBeenCalled();
      });
      expect(mockNavigateWithQuery).toHaveBeenCalledWith(
        '/pair/auth/wait_for_supp'
      );
    });

    it('shows error when validatePairingClient fails', async () => {
      mockIntegration.validatePairingClient.mockReturnValue(false);
      renderWithAppContext(
        <AuthAllow
          email={MOCK_EMAIL}
          integration={mockIntegration as unknown as Integration}
        />
      );

      expect(
        await screen.findByText('Invalid pairing client')
      ).toBeInTheDocument();
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

      expect(await screen.findByText('Firefox on macOS')).toBeInTheDocument();
    });
  });

  describe('TOTP gate', () => {
    it('checks TOTP status against the session the browser will pair with', async () => {
      const accountProfile = mockProfileWithoutTotp();
      renderWithAppContext(
        <AuthAllow
          email={MOCK_EMAIL}
          suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
        />,
        { accountProfile }
      );

      await waitFor(() => {
        expect(accountProfile).toHaveBeenCalledWith(
          MOCK_AUTHORITY_ACCOUNT.sessionToken
        );
      });
    });

    it('renders the approval page when "otp" is not in authenticationMethods', async () => {
      renderWithAppContext(
        <AuthAllow
          email={MOCK_EMAIL}
          suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
        />,
        { accountProfile: mockProfileWithoutTotp() }
      );

      expect(
        await screen.findByRole('button', APPROVE_BUTTON)
      ).toBeInTheDocument();
      expect(mockNavigateWithQuery).not.toHaveBeenCalled();
    });

    it('redirects to /pair/auth/totp when "otp" is an available AMR', async () => {
      renderWithAppContext(
        <AuthAllow
          email={MOCK_EMAIL}
          suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
        />,
        { accountProfile: mockProfileWithTotp() }
      );

      await waitFor(() => {
        expect(mockNavigateWithQuery).toHaveBeenCalledWith('/pair/auth/totp');
      });
      expect(
        screen.queryByRole('button', APPROVE_BUTTON)
      ).not.toBeInTheDocument();
    });

    it('renders the approval page once a code was accepted for this pairing', async () => {
      markPairingTotpVerified(MOCK_CHANNEL_ID);
      renderWithAppContext(
        <AuthAllow
          email={MOCK_EMAIL}
          suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
        />,
        { accountProfile: mockProfileWithTotp() }
      );

      expect(
        await screen.findByRole('button', APPROVE_BUTTON)
      ).toBeInTheDocument();
      expect(mockNavigateWithQuery).not.toHaveBeenCalled();
    });

    it('redirects to /pair/auth/totp when the code was accepted for another pairing', async () => {
      markPairingTotpVerified('9f8e7d6c5b4a3210');
      renderWithAppContext(
        <AuthAllow
          email={MOCK_EMAIL}
          suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
        />,
        { accountProfile: mockProfileWithTotp() }
      );

      await waitFor(() => {
        expect(mockNavigateWithQuery).toHaveBeenCalledWith('/pair/auth/totp');
      });
    });

    it('cancels pairing when the browser reports no signed-in account', async () => {
      mockRequestSignedInUser.mockResolvedValue(undefined);
      const accountProfile = mockProfileWithoutTotp();
      renderWithAppContext(
        <AuthAllow
          email={MOCK_EMAIL}
          suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
        />,
        { accountProfile }
      );

      await waitFor(() => {
        expect(mockNavigateWithQuery).toHaveBeenCalledWith('/pair/failure');
      });
      expect(accountProfile).not.toHaveBeenCalled();
      expect(
        screen.queryByRole('button', APPROVE_BUTTON)
      ).not.toBeInTheDocument();
    });

    it('cancels pairing when the TOTP status cannot be read', async () => {
      renderWithAppContext(
        <AuthAllow
          email={MOCK_EMAIL}
          suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
        />,
        { accountProfile: jest.fn().mockRejectedValue(new Error('offline')) }
      );

      await waitFor(() => {
        expect(mockNavigateWithQuery).toHaveBeenCalledWith('/pair/failure');
      });
      expect(
        screen.queryByRole('button', APPROVE_BUTTON)
      ).not.toBeInTheDocument();
    });
  });
});
