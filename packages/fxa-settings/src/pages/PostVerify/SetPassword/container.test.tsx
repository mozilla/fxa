/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as SetPasswordModule from '.';
import * as CacheModule from '../../../lib/cache';
import * as ModelsModule from '../../../models';

import { LocationProvider } from '@reach/router';
import { act } from '@testing-library/react';
import AuthClient from 'fxa-auth-client/browser';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import firefox from '../../../lib/channels/firefox';
import GleanMetrics from '../../../lib/glean';
import { mockUseSyncEngines } from '../../../lib/hooks/useSyncEngines/mocks';
import {
  useFinishOAuthFlowHandler,
  useOAuthKeysCheck,
} from '../../../lib/oauth/hooks';
import { getSyncEngineIds, syncEngineConfigs } from '../../../lib/sync-engines';
import { mockSensitiveDataClient as createMockSensitiveDataClient } from '../../../models/mocks';
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
import * as SigninUtils from '../../Signin/utils';
import SetPasswordContainer from './container';
import { SetPasswordProps } from './interfaces';

jest.mock('../../../models', () => ({
  ...jest.requireActual('../../../models'),
  useAuthClient: jest.fn(),
  useSensitiveDataClient: jest.fn(),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    thirdPartyAuthSetPassword: {
      success: jest.fn(),
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
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  navigate: jest.fn(),
  useNavigate: () => mockNavigate,
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
  storedAccount = {
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

function render(integration = mockSyncDesktopV3Integration()) {
  const useSyncEnginesResult = mockUseSyncEngines();
  renderWithLocalizationProvider(
    <LocationProvider>
      <SetPasswordContainer
        {...{
          flowQueryParams: {},
          integration,
          useSyncEnginesResult,
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
    wantsKeys: () => true,
    data: { service: 'sync' },
    isDesktopSync: () => true,
    isFirefoxClientServiceRelay: () => false,
    isFirefoxClientServiceAiMode: () => false,
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
    wantsKeys: () => true,
    data: { service: 'sync' },
    isDesktopSync: () => true,
    isFirefoxClientServiceRelay: () => false,
    isFirefoxClientServiceAiMode: () => false,
    isFirefoxMobileClient: () => isFirefoxMobileClient,
    getCmsInfo: () => undefined,
    getWebChannelServices: mockGetWebChannelServices({ isSync: true }),
  } as ModelsModule.Integration;
}

describe('SetPassword-container', () => {
  const offeredEngines = getSyncEngineIds(syncEngineConfigs);

  beforeEach(() => {
    applyDefaultMocks();
  });

  it('navigates to signin when local storage values are missing', async () => {
    const storedAccount = {
      ...MOCK_STORED_ACCOUNT,
      email: '',
    };
    mockCurrentAccount(storedAccount);

    render();
    expect(mockNavigate).toHaveBeenCalledWith('/signin', { replace: true });
    expect(SetPasswordModule.default).not.toHaveBeenCalled();
  });

  it('renders the component when local storage values are present', async () => {
    render();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(SetPasswordModule.default).toHaveBeenCalled();
    expect(currentSetPasswordProps).toBeDefined();
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

      expect(currentSetPasswordProps?.createPasswordHandler).toBeDefined();
      await act(async () => {
        await currentSetPasswordProps?.createPasswordHandler(MOCK_PASSWORD);
      });

      expect(
        GleanMetrics.thirdPartyAuthSetPassword.success
      ).toHaveBeenCalledWith({
        sync: {
          cwts: Object.fromEntries(
            offeredEngines.map((engine) => [engine, true])
          ),
        },
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

      expect(currentSetPasswordProps?.createPasswordHandler).toBeDefined();
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
        ...MOCK_OAUTH_FLOW_HANDLER_RESPONSE,
      });
    });

    it('handleNavigation does not navigate when integration isFirefoxMobileClient', async () => {
      render(mockOAuthNativeIntegration({ isFirefoxMobileClient: true }));

      expect(currentSetPasswordProps?.createPasswordHandler).toBeDefined();

      await act(async () => {
        await currentSetPasswordProps?.createPasswordHandler(MOCK_PASSWORD);
      });

      expect(handleNavigationSpy).toHaveBeenCalledWith(
        expect.objectContaining({ performNavigation: false })
      );
    });
  });
});
