/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as ModelsModule from '../../../models';
import * as CacheModule from '../../../lib/cache';
import * as SetPasswordModule from '.';
import { StoredAccountData } from '../../../lib/storage-utils';

import AuthClient from 'fxa-auth-client/browser';
import {
  MOCK_AUTH_PW,
  MOCK_EMAIL,
  MOCK_KEY_FETCH_TOKEN,
  MOCK_OAUTH_FLOW_HANDLER_RESPONSE,
  MOCK_PASSWORD,
  MOCK_SESSION_TOKEN,
  MOCK_STORED_ACCOUNT,
  MOCK_UID,
  MOCK_UNWRAP_BKEY,
  mockGetWebChannelServices,
} from '../../mocks';
import { SetPasswordProps } from './interfaces';
import { LocationProvider } from '@reach/router';
import SetPasswordContainer from './container';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { mockSensitiveDataClient as createMockSensitiveDataClient } from '../../../models/mocks';
import { act, waitFor } from '@testing-library/react';
import { getSyncEngineIds, syncEngineConfigs } from '../../../lib/sync-engines';
import {
  useFinishOAuthFlowHandler,
  useOAuthKeysCheck,
} from '../../../lib/oauth/hooks';
import firefox from '../../../lib/channels/firefox';
import GleanMetrics from '../../../lib/glean';
import { mockUseFxAStatus } from '../../../lib/hooks/useFxAStatus/mocks';
import * as SigninUtils from '../../Signin/utils';

jest.mock('../../../models', () => ({
  ...jest.requireActual('../../../models'),
  useAuthClient: jest.fn(),
  useSensitiveDataClient: jest.fn(),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    postVerifySetPassword: {
      success: jest.fn(),
    },
    passkey: {
      authSuccess: jest.fn(),
    },
  },
}));

const mockAuthClient = new AuthClient('http://localhost:9000', {
  keyStretchVersion: 1,
});
jest.mock('../../../lib/oauth/hooks.tsx', () => {
  return {
    __esModule: true,
    useFinishOAuthFlowHandler: jest.fn(),
    useOAuthKeysCheck: jest.fn(),
  };
});

const mockSensitiveDataClient = createMockSensitiveDataClient();
mockSensitiveDataClient.setDataType = jest.fn();

const mockNavigate = jest.fn();
const mockLocation = {
  state: undefined as Record<string, unknown> | undefined,
};
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  navigate: jest.fn(),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    pathname: '/post_verify/set_password',
    search: '',
    hash: '',
    state: mockLocation.state,
  }),
}));
function mockModelsModule() {
  mockAuthClient.createPassword = jest.fn().mockResolvedValue({
    passwordCreated: 123456,
    authPW: MOCK_AUTH_PW,
    unwrapBKey: MOCK_UNWRAP_BKEY,
  });
  mockAuthClient.sessionReauthWithAuthPW = jest
    .fn()
    .mockResolvedValue({ keyFetchToken: MOCK_KEY_FETCH_TOKEN });
  mockAuthClient.accountStatus = jest.fn().mockResolvedValue({
    hasPassword: false,
  });
  (ModelsModule.useAuthClient as jest.Mock).mockImplementation(
    () => mockAuthClient
  );
  (ModelsModule.useSensitiveDataClient as jest.Mock).mockImplementation(
    () => mockSensitiveDataClient
  );
  (useOAuthKeysCheck as jest.Mock).mockImplementation(() => ({
    oAuthKeysCheckError: null,
  }));
}
// Call this when testing local storage
function mockCurrentAccount(
  storedAccount: StoredAccountData = {
    uid: MOCK_UID,
    sessionToken: MOCK_SESSION_TOKEN,
    email: MOCK_EMAIL,
  }
) {
  jest.spyOn(CacheModule, 'currentAccount').mockReturnValue(storedAccount);
}

let currentSetPasswordProps: SetPasswordProps | undefined;
function mockSetPasswordModule() {
  jest
    .spyOn(SetPasswordModule, 'default')
    .mockImplementation((props: SetPasswordProps) => {
      currentSetPasswordProps = props;
      return <div>set password mock</div>;
    });
}

function applyDefaultMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();
  mockModelsModule();
  mockSetPasswordModule();
  mockCurrentAccount(MOCK_STORED_ACCOUNT);
  (useFinishOAuthFlowHandler as jest.Mock).mockImplementation(() => ({
    finishOAuthFlowHandler: jest
      .fn()
      .mockReturnValueOnce(MOCK_OAUTH_FLOW_HANDLER_RESPONSE),
    oAuthDataError: null,
  }));
}

function render(
  integration = mockSyncDesktopV3Integration(),
  {
    supportsKeysOptionalLogin = false,
  }: { supportsKeysOptionalLogin?: boolean } = {}
) {
  const useFxAStatusResult = mockUseFxAStatus({ supportsKeysOptionalLogin });
  renderWithLocalizationProvider(
    <LocationProvider>
      <SetPasswordContainer
        {...{
          flowQueryParams: {},
          integration,
          useFxAStatusResult,
        }}
      />
    </LocationProvider>
  );
}
function mockSyncDesktopV3Integration() {
  return {
    type: ModelsModule.IntegrationType.SyncDesktopV3,
    getService: () => 'sync',
    getClientId: () => undefined,
    isSync: () => true,
    requiresKeys: () => true,
    wantsKeys: () => true,
    requiresPasswordForLogin: () => true,
    data: { service: 'sync' },
    isDesktopSync: () => true,
    isFirefoxClientServiceRelay: () => false,
    isFirefoxClientServiceSmartWindow: () => false,
    isFirefoxClientServiceVpn: () => false,
    isFirefoxNonSync: () => false,
    isFirefoxMobileClient: () => false,
    getCmsInfo: () => undefined,
    getWebChannelServices: mockGetWebChannelServices({ isSync: true }),
  } as ModelsModule.Integration;
}
function mockOAuthNativeIntegration(
  { isFirefoxMobileClient } = {
    isFirefoxMobileClient: false,
  }
) {
  return {
    type: ModelsModule.IntegrationType.OAuthNative,
    getService: () => 'sync',
    getClientId: () => undefined,
    isSync: () => true,
    requiresKeys: () => true,
    wantsKeys: () => true,
    requiresPasswordForLogin: () => true,
    data: { service: 'sync' },
    isDesktopSync: () => true,
    isFirefoxClientServiceRelay: () => false,
    isFirefoxClientServiceSmartWindow: () => false,
    isFirefoxClientServiceVpn: () => false,
    isFirefoxNonSync: () => false,
    isFirefoxMobileClient: () => isFirefoxMobileClient,
    getCmsInfo: () => undefined,
    getWebChannelServices: mockGetWebChannelServices({ isSync: true }),
  } as ModelsModule.Integration;
}
// A non-Sync Firefox client (VPN) whose scope requests keys. This tests
// the mobile case where Sync has not been decoupled yet.
function mockVpnOAuthNativeIntegration() {
  return {
    type: ModelsModule.IntegrationType.OAuthNative,
    getService: () => 'vpn',
    getClientId: () => undefined,
    isSync: () => false,
    requiresKeys: () => false,
    wantsKeysIfPasswordEntered: () => true,
    wantsKeys: () => true,
    requiresPasswordForLogin(supportsKeysOptionalLogin = false) {
      return (
        this.requiresKeys() ||
        (!supportsKeysOptionalLogin && this.wantsKeysIfPasswordEntered())
      );
    },
    data: { service: 'vpn' },
    isDesktopSync: () => false,
    isFirefoxClientServiceRelay: () => false,
    isFirefoxClientServiceSmartWindow: () => false,
    isFirefoxClientServiceVpn: () => true,
    isFirefoxNonSync: () => true,
    isFirefoxMobileClient: () => true,
    getCmsInfo: () => undefined,
    getWebChannelServices: mockGetWebChannelServices({ isSync: false }),
  } as ModelsModule.Integration;
}

describe('SetPassword-container', () => {
  const offeredEngines = getSyncEngineIds(syncEngineConfigs);

  beforeEach(() => {
    applyDefaultMocks();
    mockLocation.state = undefined;
  });

  it('navigates to signin when local storage values are missing', async () => {
    const storedAccount = {
      ...MOCK_STORED_ACCOUNT,
      email: '',
    };
    mockCurrentAccount(storedAccount);

    render();
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/signin', { replace: true });
    });
    expect(SetPasswordModule.default).not.toHaveBeenCalled();
  });

  it('renders the component when local storage values are present', async () => {
    render();
    await waitFor(() => {
      expect(SetPasswordModule.default).toHaveBeenCalled();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(currentSetPasswordProps).toBeDefined();
  });

  // "keys not optional" = Firefox where Sync isn't decoupled: desktop before
  // 147, and Mobile as of Firefox 153.
  it('renders for the non-Sync VPN flow that needs keys when keys are not optional', async () => {
    render(mockVpnOAuthNativeIntegration(), {
      supportsKeysOptionalLogin: false,
    });
    await waitFor(() => {
      expect(SetPasswordModule.default).toHaveBeenCalled();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('redirects to signin for the non-Sync VPN flow when the browser supports keys-optional login', async () => {
    render(mockVpnOAuthNativeIntegration(), {
      supportsKeysOptionalLogin: true,
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/signin', { replace: true });
    });
    expect(SetPasswordModule.default).not.toHaveBeenCalled();
  });

  it('redirects to signin when user already has a password', async () => {
    mockAuthClient.accountStatus = jest.fn().mockResolvedValue({
      hasPassword: true,
    });
    render();
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/signin', { replace: true });
    });
    expect(SetPasswordModule.default).not.toHaveBeenCalled();
  });

  describe('password state gating', () => {
    it('skips the check and renders when stored state is passwordless', async () => {
      mockCurrentAccount({ ...MOCK_STORED_ACCOUNT, hasPassword: false });
      render();
      await waitFor(() => {
        expect(SetPasswordModule.default).toHaveBeenCalled();
      });
      expect(mockAuthClient.accountStatus).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('skips the check and redirects to signin when stored state has a password', async () => {
      mockCurrentAccount({ ...MOCK_STORED_ACCOUNT, hasPassword: true });
      render();
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/signin', { replace: true });
      });
      expect(mockAuthClient.accountStatus).not.toHaveBeenCalled();
      expect(SetPasswordModule.default).not.toHaveBeenCalled();
    });

    it('falls back to the accountStatus check when stored state is unknown', async () => {
      mockCurrentAccount({ ...MOCK_STORED_ACCOUNT, hasPassword: undefined });
      render();
      await waitFor(() => {
        expect(SetPasswordModule.default).toHaveBeenCalled();
      });
      expect(mockAuthClient.accountStatus).toHaveBeenCalledWith(
        undefined,
        MOCK_SESSION_TOKEN
      );
    });

    it('treats a failed fallback check as no password and renders', async () => {
      mockCurrentAccount({ ...MOCK_STORED_ACCOUNT, hasPassword: undefined });
      mockAuthClient.accountStatus = jest
        .fn()
        .mockRejectedValue(new Error('network failure'));
      render();
      await waitFor(() => {
        expect(SetPasswordModule.default).toHaveBeenCalled();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('calling createPassword', () => {
    let fxaLoginSpy: jest.SpyInstance;
    let fxaOAuthLoginSpy: jest.SpyInstance;
    let handleNavigationSpy: jest.SpyInstance;

    beforeEach(() => {
      fxaLoginSpy = jest.spyOn(firefox, 'fxaLogin');
      fxaOAuthLoginSpy = jest.spyOn(firefox, 'fxaOAuthLogin');
      handleNavigationSpy = jest.spyOn(SigninUtils, 'handleNavigation');
    });

    afterEach(() => {
      handleNavigationSpy.mockRestore();
    });

    it('does the expected things with desktop v3', async () => {
      render();

      await waitFor(() => {
        expect(currentSetPasswordProps?.createPasswordHandler).toBeDefined();
      });
      await act(async () => {
        await currentSetPasswordProps?.createPasswordHandler(MOCK_PASSWORD);
      });

      expect(GleanMetrics.postVerifySetPassword.success).toHaveBeenCalledWith({
        event: { reason: 'third_party_auth' },
      });
      expect(fxaLoginSpy).toHaveBeenCalledWith({
        email: MOCK_EMAIL,
        sessionToken: MOCK_SESSION_TOKEN,
        uid: MOCK_UID,
        verified: true,
        keyFetchToken: MOCK_KEY_FETCH_TOKEN,
        unwrapBKey: MOCK_UNWRAP_BKEY,
        services: {
          sync: {
            offeredEngines,
            declinedEngines: [],
          },
        },
      });
      expect(fxaOAuthLoginSpy).not.toHaveBeenCalled();
    });

    it('does the expected things with oauth native', async () => {
      render(mockOAuthNativeIntegration());

      await waitFor(() => {
        expect(currentSetPasswordProps?.createPasswordHandler).toBeDefined();
      });
      await act(async () => {
        await currentSetPasswordProps?.createPasswordHandler(MOCK_PASSWORD);
      });
      expect(fxaLoginSpy).toHaveBeenCalledWith({
        email: MOCK_EMAIL,
        sessionToken: MOCK_SESSION_TOKEN,
        uid: MOCK_UID,
        verified: true,
        services: {
          sync: {
            offeredEngines,
            declinedEngines: [],
          },
        },
      });
      expect(firefox.fxaOAuthLogin).toHaveBeenCalledWith({
        action: 'signin',
        code: MOCK_OAUTH_FLOW_HANDLER_RESPONSE.code,
        redirect: MOCK_OAUTH_FLOW_HANDLER_RESPONSE.redirect,
        state: MOCK_OAUTH_FLOW_HANDLER_RESPONSE.state,
        scope: MOCK_OAUTH_FLOW_HANDLER_RESPONSE.scope,
      });
    });

    it('handleNavigation does not navigate when integration isFirefoxMobileClient', async () => {
      render(mockOAuthNativeIntegration({ isFirefoxMobileClient: true }));

      await waitFor(() => {
        expect(currentSetPasswordProps?.createPasswordHandler).toBeDefined();
      });

      await act(async () => {
        await currentSetPasswordProps?.createPasswordHandler(MOCK_PASSWORD);
      });

      expect(handleNavigationSpy).toHaveBeenCalledWith(
        expect.objectContaining({ performNavigation: false })
      );
    });

    // Passkey reasons are surface-tagged (`<surface>_passkey`) and covered by
    // the dedicated tests below; non-passkey reasons pass through unchanged.
    it.each(['third_party_auth' as const, 'otp' as const])(
      'fires postVerifySetPassword.success with reason="%s" when passwordCreationReason matches',
      async (reason) => {
        mockLocation.state = { passwordCreationReason: reason };
        render();

        await waitFor(() => {
          expect(currentSetPasswordProps?.createPasswordHandler).toBeDefined();
        });
        await act(async () => {
          await currentSetPasswordProps?.createPasswordHandler(MOCK_PASSWORD);
        });

        expect(GleanMetrics.postVerifySetPassword.success).toHaveBeenCalledWith(
          { event: { reason } }
        );
      }
    );

    it.each([
      ['emailfirst' as const, 'emailfirst_createdpassword'],
      ['signin' as const, 'signin_createdpassword'],
      ['otplogin' as const, 'otplogin_createdpassword'],
      ['alternative_auth' as const, 'alternative_auth_createdpassword'],
    ])(
      'fires passkey.auth_success with reason="%s" on the passkey-flow createPassword success (passkeySurface=%s)',
      async (passkeySurface, expectedReason) => {
        mockLocation.state = {
          passwordCreationReason: 'passkey',
          passkeySurface,
        };
        render();

        await waitFor(() => {
          expect(currentSetPasswordProps?.createPasswordHandler).toBeDefined();
        });
        await act(async () => {
          await currentSetPasswordProps?.createPasswordHandler(MOCK_PASSWORD);
        });

        expect(GleanMetrics.passkey.authSuccess).toHaveBeenCalledWith({
          event: { reason: expectedReason },
        });
      }
    );

    it.each([
      ['emailfirst' as const, 'emailfirst_passkey'],
      ['signin' as const, 'signin_passkey'],
      ['otplogin' as const, 'otplogin_passkey'],
      ['alternative_auth' as const, 'alternative_auth_passkey'],
    ])(
      'tags postVerifySetPassword.success with the surface reason (passkeySurface=%s -> %s)',
      async (passkeySurface, expectedReason) => {
        mockLocation.state = {
          passwordCreationReason: 'passkey',
          passkeySurface,
        };
        render();

        await waitFor(() => {
          expect(currentSetPasswordProps?.createPasswordHandler).toBeDefined();
        });
        await act(async () => {
          await currentSetPasswordProps?.createPasswordHandler(MOCK_PASSWORD);
        });

        expect(GleanMetrics.postVerifySetPassword.success).toHaveBeenCalledWith(
          { event: { reason: expectedReason } }
        );
      }
    );

    it('defaults passkeySurface to emailfirst when missing from router state', async () => {
      mockLocation.state = { passwordCreationReason: 'passkey' };
      render();
      await waitFor(() => {
        expect(currentSetPasswordProps?.createPasswordHandler).toBeDefined();
      });
      await act(async () => {
        await currentSetPasswordProps?.createPasswordHandler(MOCK_PASSWORD);
      });
      expect(GleanMetrics.passkey.authSuccess).toHaveBeenCalledWith({
        event: { reason: 'emailfirst_createdpassword' },
      });
      // The funnel reason defaults the same way, so it stays in-vocabulary
      // (`emailfirst_passkey`) rather than emitting a bare `passkey`.
      expect(GleanMetrics.postVerifySetPassword.success).toHaveBeenCalledWith({
        event: { reason: 'emailfirst_passkey' },
      });
    });

    it('does NOT fire passkey.auth_success for non-passkey flows', async () => {
      mockLocation.state = { passwordCreationReason: 'otp' };
      render();
      await waitFor(() => {
        expect(currentSetPasswordProps?.createPasswordHandler).toBeDefined();
      });
      await act(async () => {
        await currentSetPasswordProps?.createPasswordHandler(MOCK_PASSWORD);
      });
      expect(GleanMetrics.passkey.authSuccess).not.toHaveBeenCalled();
    });
  });
});
