/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { act, screen, fireEvent, waitFor } from '@testing-library/react';
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
import { MemoryRouter } from 'react-router';
import { mockUseFxAStatus } from '../../../lib/hooks/useFxAStatus/mocks';
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

// Default to no session token; tests override via mockGetBasicAccountData.
jest.mock('../../../lib/account-storage', () => ({
  getBasicAccountData: jest.fn().mockReturnValue(null),
}));
const { getBasicAccountData: mockGetBasicAccountData } = jest.requireMock(
  '../../../lib/account-storage'
);

const MOCK_EMAIL = MOCK_ACCOUNT.primaryEmail.email;

// Helper to render with AppContext (authClient) and MemoryRouter (useLocation)
function renderWithAppContext(
  ui: React.ReactElement,
  authClientOverrides: Partial<{
    accountProfile: jest.Mock;
  }> = {
    accountProfile: jest
      .fn()
      .mockResolvedValue({ authenticationMethods: ['pwd', 'email'] }),
  }
) {
  const appCtx = mockAppContext();
  if (appCtx.authClient) {
    Object.assign(appCtx.authClient as object, authClientOverrides);
  }
  return renderWithLocalizationProvider(
    <AppContext.Provider value={appCtx}>
      <MemoryRouter initialEntries={['/pair/auth/allow']}>{ui}</MemoryRouter>
    </AppContext.Provider>
  );
}

describe('Pair/AuthAllow page', () => {
  beforeEach(() => {
    mockGetBasicAccountData.mockReturnValue({
      sessionToken: 'deadbeef',
      uid: 'uid-123',
    });
  });

  // TODO: enable l10n tests when FXA-6461 is resolved (handle embedded tags)
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });
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
    screen.getByRole('button', { name: 'Yes, approve device' });
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

    await screen.findByText('Vancouver, British Columbia, Canada (estimated)');
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
        await screen.findByRole('button', { name: 'Yes, approve device' })
      );
      await waitFor(() => {
        expect(mockIntegration.authorize).toHaveBeenCalled();
        expect(mockNavigateWithQuery).toHaveBeenCalledWith(
          '/pair/auth/wait_for_supp'
        );
      });
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
      await waitFor(() => {
        expect(screen.getByText('Firefox on macOS')).toBeInTheDocument();
      });
    });
  });

  describe('TOTP gate', () => {
    beforeEach(() => {
      mockNavigateWithQuery.mockClear();
      mockGetBasicAccountData.mockReturnValue({
        sessionToken: 'deadbeef',
        uid: 'uid-123',
      });
    });

    afterEach(() => {
      mockGetBasicAccountData.mockReturnValue(null);
    });

    it('does not redirect when "otp" is not in authenticationMethods', async () => {
      const accountProfile = jest
        .fn()
        .mockResolvedValue({ authenticationMethods: ['pwd', 'email'] });
      renderWithAppContext(
        <AuthAllow
          email={MOCK_EMAIL}
          suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
        />,
        { accountProfile }
      );

      await waitFor(() => {
        expect(accountProfile).toHaveBeenCalledWith('deadbeef');
      });
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Yes, approve device' })
        ).toBeInTheDocument();
      });
      expect(mockNavigateWithQuery).not.toHaveBeenCalledWith('/pair/auth/totp');
    });

    it('redirects to /pair/auth/totp when "otp" is an available AMR', async () => {
      const accountProfile = jest
        .fn()
        .mockResolvedValue({ authenticationMethods: ['pwd', 'email', 'otp'] });
      renderWithAppContext(
        <AuthAllow
          email={MOCK_EMAIL}
          suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
        />,
        { accountProfile }
      );
      await waitFor(() => {
        expect(mockNavigateWithQuery).toHaveBeenCalledWith('/pair/auth/totp');
      });
    });

    it('redirects to /pair/auth/totp when the profile lookup fails', async () => {
      const accountProfile = jest
        .fn()
        .mockRejectedValue(new Error('Backend service failure'));
      renderWithAppContext(
        <AuthAllow
          email={MOCK_EMAIL}
          suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
        />,
        { accountProfile }
      );
      await waitFor(() => {
        expect(mockNavigateWithQuery).toHaveBeenCalledWith('/pair/auth/totp');
      });
    });

    it('redirects to /pair/auth/totp when the Sync account has no session token', async () => {
      mockGetBasicAccountData.mockReturnValue(null);
      const accountProfile = jest.fn();
      renderWithAppContext(
        <AuthAllow
          email={MOCK_EMAIL}
          suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
          fxaStatusResult={mockUseFxAStatus({
            signedInUser: {
              uid: 'sync-uid',
              email: 'sync@example.com',
              sessionToken: undefined,
              verified: true,
            },
          })}
        />,
        { accountProfile }
      );
      await waitFor(() => {
        expect(mockNavigateWithQuery).toHaveBeenCalledWith('/pair/auth/totp');
      });
      expect(accountProfile).not.toHaveBeenCalled();
    });

    it.each(['unanswered', 'answered'] as const)(
      'redirects to /pair/auth/totp when fxa_status is %s with no Sync account and there is no session token',
      async (fxaStatusState) => {
        mockGetBasicAccountData.mockReturnValue(null);
        const accountProfile = jest.fn();
        renderWithAppContext(
          <AuthAllow
            email={MOCK_EMAIL}
            suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
            fxaStatusResult={mockUseFxAStatus({ fxaStatusState })}
          />,
          { accountProfile }
        );
        await waitFor(() => {
          expect(mockNavigateWithQuery).toHaveBeenCalledWith('/pair/auth/totp');
        });
        expect(
          screen.queryByRole('button', { name: 'Yes, approve device' })
        ).not.toBeInTheDocument();
        expect(accountProfile).not.toHaveBeenCalled();
      }
    );

    describe('when Firefox Sync is signed in to another account', () => {
      const SYNC_USER = {
        uid: 'sync-uid',
        email: 'sync@example.com',
        sessionToken: 'sync-token',
        verified: true,
      };
      const accountProfile = jest.fn(async (token: string) => ({
        authenticationMethods:
          token === 'sync-token' ? ['pwd', 'otp'] : ['pwd'],
      }));

      beforeEach(() => {
        accountProfile.mockClear();
        mockGetBasicAccountData.mockImplementation((uid?: string) =>
          uid ? null : { uid: 'local-uid', sessionToken: 'local-token' }
        );
      });

      afterEach(() => {
        mockGetBasicAccountData.mockReset().mockReturnValue(null);
      });

      it('redirects to /pair/auth/totp for the Sync account, not the current local account', async () => {
        renderWithAppContext(
          <AuthAllow
            email={MOCK_EMAIL}
            suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
            fxaStatusResult={mockUseFxAStatus({ signedInUser: SYNC_USER })}
          />,
          { accountProfile }
        );

        await waitFor(() => {
          expect(mockNavigateWithQuery).toHaveBeenCalledWith('/pair/auth/totp');
        });
        expect(accountProfile).toHaveBeenCalledWith('sync-token');
        expect(accountProfile).not.toHaveBeenCalledWith('local-token');
      });

      it('checks the Sync account when no local account is stored', async () => {
        mockGetBasicAccountData.mockReturnValue(null);
        renderWithAppContext(
          <AuthAllow
            email={MOCK_EMAIL}
            suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
            fxaStatusResult={mockUseFxAStatus({ signedInUser: SYNC_USER })}
          />,
          { accountProfile }
        );

        await waitFor(() => {
          expect(mockNavigateWithQuery).toHaveBeenCalledWith('/pair/auth/totp');
        });
      });

      describe('when fxa_status changes after render', () => {
        type FxAStatusResult = ReturnType<typeof mockUseFxAStatus>;
        let setFxaStatusResult: (result: FxAStatusResult) => void;
        const AuthAllowWithStatus = ({
          initial,
        }: {
          initial: FxAStatusResult;
        }) => {
          const [fxaStatusResult, setResult] = React.useState(initial);
          setFxaStatusResult = setResult;
          return (
            <AuthAllow
              email={MOCK_EMAIL}
              suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
              {...{ fxaStatusResult }}
            />
          );
        };

        it('waits for fxa_status, then checks the Sync account', async () => {
          renderWithAppContext(
            <AuthAllowWithStatus
              initial={mockUseFxAStatus({ fxaStatusState: 'pending' })}
            />,
            { accountProfile }
          );
          expect(accountProfile).not.toHaveBeenCalled();
          expect(
            screen.queryByRole('button', { name: 'Yes, approve device' })
          ).not.toBeInTheDocument();

          act(() =>
            setFxaStatusResult(mockUseFxAStatus({ signedInUser: SYNC_USER }))
          );

          await waitFor(() => {
            expect(mockNavigateWithQuery).toHaveBeenCalledWith(
              '/pair/auth/totp'
            );
          });
          expect(accountProfile).toHaveBeenCalledWith('sync-token');
        });

        it('hides the approve button until an in-flight check resolves', async () => {
          let resolveProfile: (profile: {
            authenticationMethods: string[];
          }) => void = () => {};
          const slowAccountProfile = jest.fn(
            () =>
              new Promise<{ authenticationMethods: string[] }>((resolve) => {
                resolveProfile = resolve;
              })
          );
          renderWithAppContext(
            <AuthAllowWithStatus
              initial={mockUseFxAStatus({ signedInUser: SYNC_USER })}
            />,
            { accountProfile: slowAccountProfile }
          );
          await waitFor(() => expect(slowAccountProfile).toHaveBeenCalled());

          act(() =>
            setFxaStatusResult(
              mockUseFxAStatus({ signedInUser: { ...SYNC_USER } })
            )
          );
          expect(
            screen.queryByRole('button', { name: 'Yes, approve device' })
          ).not.toBeInTheDocument();

          await act(async () =>
            resolveProfile({ authenticationMethods: ['pwd'] })
          );
          expect(
            await screen.findByRole('button', { name: 'Yes, approve device' })
          ).toBeInTheDocument();
          expect(slowAccountProfile).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});
