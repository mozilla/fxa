/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as UseValidateModule from '../../lib/hooks/useValidate';
import * as SigninModule from './index';
import * as ModelsModule from '../../models';
import * as ReactUtils from 'fxa-react/lib/utils';
import * as CacheModule from '../../lib/cache';
import * as CryptoModule from 'fxa-auth-client/lib/crypto';
import * as SentryModule from '@sentry/browser';

import { LocationProvider } from '@reach/router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import SigninContainer from './container';
import { BeginSigninResult, SigninProps } from './interfaces';
import { MozServices } from '../../lib/types';
import { act, screen, waitFor } from '@testing-library/react';
import { Integration, IntegrationType, WebIntegration } from '../../models';
import { GenericData, ModelDataProvider } from '../../lib/model-data';
import {
  MOCK_STORED_ACCOUNT,
  MOCK_EMAIL,
  MOCK_PASSWORD,
  MOCK_AUTH_PW,
  MOCK_UID,
  MOCK_SESSION_TOKEN,
  MOCK_AUTH_AT,
  MOCK_UNWRAP_BKEY,
  MOCK_CLIENT_SALT,
  MOCK_AUTH_PW_V2,
  MOCK_WRAP_KB,
  MOCK_WRAP_KB_V2,
  MOCK_UNWRAP_BKEY_V2,
  MOCK_VERIFICATION,
  MOCK_KB,
  MOCK_FLOW_ID,
  MOCK_CLIENT_ID,
  MOCK_KEY_FETCH_TOKEN,
} from './mocks';
import { mockUseFxAStatus } from '../../lib/hooks/useFxAStatus/mocks';
import AuthClient from 'fxa-auth-client/browser';
import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';

import { ensureCanLinkAcountOrRedirect } from './utils';
import { mockSensitiveDataClient as createMockSensitiveDataClient } from '../../models/mocks';
import { SensitiveData } from '../../lib/sensitive-data-client';
import { Constants } from '../../lib/constants';
import { useFinishOAuthFlowHandler } from '../../lib/oauth/hooks';
import {
  OAuthNativeSyncQueryParameters,
  OAuthQueryParams,
  SigninQueryParams,
} from '../../models/pages/signin';
import { storeAccountData } from '../../lib/storage-utils';

jest.mock('../../lib/channels/firefox', () => ({
  ...jest.requireActual('../../lib/channels/firefox'),
  firefox: {
    fxaCanLinkAccount: jest.fn(),
  },
}));

jest.mock('../../lib/storage-utils', () => ({
  ...jest.requireActual('../../lib/storage-utils'),
  storeAccountData: jest.fn(),
}));

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  ensureCanLinkAcountOrRedirect: jest.fn(),
}));

jest.mock('../../lib/oauth/hooks', () => ({
  ...jest.requireActual('../../lib/oauth/hooks'),
  useFinishOAuthFlowHandler: jest.fn(),
}));

let integration: Integration;

function mockSyncDesktopV3Integration() {
  integration = {
    type: IntegrationType.SyncDesktopV3,
    getService: () => 'sync',
    getClientId: () => undefined,
    isSync: () => true,
    wantsKeys: () => true,
    data: { service: 'sync' },
    isDesktopSync: () => true,
    isFirefoxClientServiceRelay: () => false,
    getCmsInfo: () => undefined,
  } as Integration;
}
function mockOAuthWebIntegration(
  { data }: { data?: { service?: string } } = { data: { service: 'sync' } }
) {
  integration = {
    type: IntegrationType.OAuthWeb,
    getService: () => MozServices.Monitor,
    getClientId: () => MOCK_CLIENT_ID,
    isSync: () => false,
    wantsKeys: () => true,
    data,
    isDesktopSync: () => false,
    isFirefoxClientServiceRelay: () => false,
    getCmsInfo: () => undefined,
  } as Integration;
}

function mockOAuthNativeIntegration() {
  integration = {
    type: IntegrationType.OAuthNative,
    getService: () => 'sync',
    getClientId: () => undefined,
    isSync: () => true,
    wantsKeys: () => true,
    isDesktopSync: () => true,
    isFirefoxClientServiceRelay: () => false,
    getCmsInfo: () => undefined,
    data: {
      service: 'sync',
      context: Constants.FX_SYNC_CONTEXT,
    },
  } as Integration;
}

function mockWebIntegration() {
  // Leaving for historical record. Remove once baked.
  // integration = {
  //   type: IntegrationType.Web,
  //   getService: () => MozServices.Default,
  //   getClientId: () => undefined,
  //   isSync: () => false,
  //   wantsKeys: () => false,
  //   isDesktopSync: () => false,
  //   isFirefoxClientServiceRelay: () => false,
  //   data: {},
  // } as Integration;

  integration = new WebIntegration(
    new GenericData({
      service: MozServices.Default,
    })
  );

  expect(integration.type).toEqual(IntegrationType.Web);
  expect(integration.getService()).toEqual(MozServices.Default);
  expect(integration.getClientId()).toEqual(undefined);
  expect(integration.isSync()).toBeFalsy();
  expect(integration.wantsKeys()).toBeFalsy();
  expect(integration.isDesktopSync()).toBeFalsy();
  expect(integration.isFirefoxClientServiceRelay()).toBeFalsy();
}

function mockFetchModule() {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ id: 'avatar-id', url: 'https://example.com/avatar.png' }),
  });
}

function applyDefaultMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();

  mockReactUtilsModule();
  mockWebIntegration();
  mockLocationState = {};

  mockSigninModule();
  mockModelsModule();
  mockUseValidateModule({ queryParams: MOCK_QUERY_PARAM_MODEL_NO_VALUES });
  mockCurrentAccount({ uid: '123' });
  mockCryptoModule();
  mockSentryModule();
  mockFetchModule();
}

let mockUseCheckReactEmailFirst = jest.fn().mockReturnValue(true);
jest.mock('../../lib/hooks', () => ({
  __esModule: true,
  ...jest.requireActual('../../lib/hooks'),
  useCheckReactEmailFirst: () => mockUseCheckReactEmailFirst(),
}));
jest.mock('../../models', () => {
  return {
    ...jest.requireActual('../../models'),
    useAuthClient: jest.fn(),
    useSensitiveDataClient: jest.fn(),
    useConfig: jest.fn(),
    useSession: jest.fn(),
  };
});
const mockAuthClient = new AuthClient('http://localhost:9000', {
  keyStretchVersion: 1,
});
const mockSensitiveDataClient = createMockSensitiveDataClient();
mockSensitiveDataClient.setDataType = jest.fn();

const mockSession = {
  isSessionVerified: jest.fn().mockResolvedValue(true),
  sendVerificationCode: jest.fn().mockResolvedValue(undefined),
  verified: false,
  token: MOCK_SESSION_TOKEN,
};

const mockFinishOAuthFlowHandler = jest.fn().mockResolvedValue({
  error: undefined,
  redirect: undefined,
  code: undefined,
  state: undefined,
});

function mockModelsModule() {
  (useFinishOAuthFlowHandler as jest.Mock).mockReturnValue({
    finishOAuthFlowHandler: mockFinishOAuthFlowHandler,
    oAuthDataError: undefined,
  });
  mockAuthClient.accountStatusByEmail = jest.fn().mockResolvedValue({
    exists: true,
    hasLinkedAccount: false,
    hasPassword: true,
  });
  mockAuthClient.accountProfile = jest
    .fn()
    .mockResolvedValue({ authenticationMethods: ['pwd', 'email'] });
  mockAuthClient.sessionStatus = jest.fn().mockResolvedValue({
    details: {
      accountEmailVerified: true,
      sessionVerified: true,
    },
  });
  mockAuthClient.recoveryKeyExists = jest.fn().mockResolvedValue({
    exists: false,
  });
  // Add auth-client methods used by the container
  mockAuthClient.getCredentialStatusV2 = jest.fn().mockResolvedValue({
    upgradeNeeded: false,
    currentVersion: 'v1',
    clientSalt: MOCK_CLIENT_SALT,
  });
  mockAuthClient.signInWithAuthPW = jest.fn().mockResolvedValue({
    uid: MOCK_UID,
    sessionToken: MOCK_SESSION_TOKEN,
    authAt: MOCK_AUTH_AT,
    metricsEnabled: true,
    emailVerified: true,
    sessionVerified: true,
    verificationMethod: VerificationMethods.EMAIL_OTP,
    verificationReason: VerificationReasons.SIGN_IN,
    keyFetchToken: MOCK_KEY_FETCH_TOKEN,
  });
  mockAuthClient.wrappedAccountKeys = jest.fn().mockResolvedValue({
    kA: MOCK_KB,
    wrapKB: MOCK_WRAP_KB,
  });
  mockAuthClient.passwordChangeStartWithAuthPW = jest.fn().mockResolvedValue({
    keyFetchToken: MOCK_KEY_FETCH_TOKEN,
    passwordChangeToken: 'mockPasswordChangeToken',
  });
  mockAuthClient.passwordChangeFinish = jest.fn().mockResolvedValue({});

  (ModelsModule.useAuthClient as jest.Mock).mockImplementation(
    () => mockAuthClient
  );
  (ModelsModule.useSensitiveDataClient as jest.Mock).mockImplementation(
    () => mockSensitiveDataClient
  );
  (ModelsModule.useConfig as jest.Mock).mockImplementation(() => ({
    featureFlags: {
      recoveryCodeSetupOnSyncSignIn: true,
    },
    servers: {
      profile: {
        url: 'http://localhost:1111',
      },
    },
  }));
  (ModelsModule.useSession as jest.Mock).mockImplementation(() => mockSession);
  mockSession.isSessionVerified = jest.fn().mockResolvedValue(true);
  mockSession.sendVerificationCode = jest.fn().mockResolvedValue(undefined);
}

// Call this when testing local storage
function mockCurrentAccount(storedAccount: any) {
  jest.spyOn(CacheModule, 'currentAccount').mockReturnValue(storedAccount);
  jest
    .spyOn(CacheModule, 'findAccountByEmail')
    .mockImplementation((email: string) => {
      return email === storedAccount.email ? storedAccount : undefined;
    });
  jest.spyOn(CacheModule, 'discardSessionToken');
}

const MOCK_QUERY_PARAM_EMAIL = 'from@queryparams.com';
let MOCK_QUERY_PARAM_MODEL = {
  email: MOCK_QUERY_PARAM_EMAIL,
  hasPassword: 'true',
  hasLinkedAccount: 'false',
  isV2: () => false,
};
const MOCK_QUERY_PARAM_MODEL_NO_VALUES = {
  email: '',
  hasPassword: undefined,
  hasLinkedAccount: undefined,
  isV2: () => false,
};

// Call this when testing query params
function mockUseValidateModule(
  {
    queryParams,
  }: {
    queryParams?: {
      email?: string;
      hasPassword?: string; // TODO: should be 'true' or 'false'
      hasLinkedAccount?: string; // TODO: should be 'true' or 'false'
      isV2: () => boolean;
    };
  } = { queryParams: MOCK_QUERY_PARAM_MODEL }
) {
  const queryParamModel = queryParams as unknown as ModelDataProvider;
  return jest
    .spyOn(UseValidateModule, 'useValidatedQueryParams')
    .mockReturnValue({
      queryParamModel,
      validationError: undefined,
    });
}

const MOCK_ROUTER_STATE_EMAIL = 'from@routerstate.com';
const MOCK_LOCATION_STATE_COMPLETE = {
  email: MOCK_ROUTER_STATE_EMAIL,
  hasPassword: true,
  hasLinkedAccount: false,
  canLinkAccountOk: undefined,
};
const MOCK_LOCATION_STATE_CAN_LINK_ACCOUNT_OK = {
  email: MOCK_ROUTER_STATE_EMAIL,
  hasPassword: true,
  hasLinkedAccount: false,
  canLinkAccountOk: true,
};
// Set this when testing location state
let mockLocationState = {};
const mockLocation = () => {
  return {
    pathname: '/signin',
    search: '?' + new URLSearchParams(mockLocationState),
    state: mockLocationState,
  };
};
const mockNavigate = jest.fn();
jest.mock('@reach/router', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@reach/router'),
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation(),
  };
});

let currentSigninProps: SigninProps | undefined;
function mockSigninModule() {
  currentSigninProps = undefined;
  jest
    .spyOn(SigninModule, 'default')
    .mockImplementation((props: SigninProps) => {
      currentSigninProps = props;
      return <div>signin mock</div>;
    });
}

function mockReactUtilsModule() {
  jest.spyOn(ReactUtils, 'hardNavigate').mockImplementation(() => {});
}

let mockGetCredentials: jest.SpyInstance;
let mockGetCredentialsV2: jest.SpyInstance;
let mockGetKeysV2: jest.SpyInstance;
let mockUnwrapKB: jest.SpyInstance;
function mockCryptoModule() {
  mockGetCredentials = jest
    .spyOn(CryptoModule, 'getCredentials')
    .mockResolvedValue({
      authPW: MOCK_AUTH_PW,
      unwrapBKey: MOCK_UNWRAP_BKEY, // needed for type
    });
  mockGetCredentialsV2 = jest
    .spyOn(CryptoModule, 'getCredentialsV2')
    .mockResolvedValue({
      clientSalt: MOCK_CLIENT_SALT,
      authPW: MOCK_AUTH_PW_V2,
      unwrapBKey: MOCK_UNWRAP_BKEY_V2,
    });
  mockGetKeysV2 = jest.spyOn(CryptoModule, 'getKeysV2').mockResolvedValue({
    kB: MOCK_KB,
    wrapKb: MOCK_WRAP_KB,
    wrapKbVersion2: MOCK_WRAP_KB_V2,
  });
  mockUnwrapKB = jest
    .spyOn(CryptoModule, 'unwrapKB')
    .mockImplementation(() => MOCK_KB);
}

let mockSentryCaptureMessage: jest.SpyInstance;
function mockSentryModule() {
  mockSentryCaptureMessage = jest.spyOn(SentryModule, 'captureMessage');
}

function render(
  options?: { useFxAStatusResult?: ReturnType<typeof mockUseFxAStatus> }
) {
  const useFxAStatusResult = options?.useFxAStatusResult || mockUseFxAStatus();

  return renderWithLocalizationProvider(
    <LocationProvider>
      <SigninContainer
        {...{
          integration,
          serviceName: MozServices.Default,
          useFxAStatusResult,
        }}
        flowQueryParams={{ flowId: MOCK_FLOW_ID }}
      />
    </LocationProvider>
  );
}

describe('signin container', () => {
  beforeEach(() => {
    applyDefaultMocks();
  });

  describe('initial states', () => {
    describe('email', () => {
      it('can be set from query param', async () => {
        mockUseValidateModule();
        render();
        await waitFor(() => {
          expect(currentSigninProps?.email).toBe(MOCK_QUERY_PARAM_EMAIL);
        });
        expect(SigninModule.default).toHaveBeenCalled();
      });
      it('router state takes precedence over query param state', async () => {
        mockUseValidateModule();
        mockLocationState = MOCK_LOCATION_STATE_COMPLETE;
        render();
        await waitFor(() => {
          expect(currentSigninProps?.email).toBe(MOCK_ROUTER_STATE_EMAIL);
        });
        expect(SigninModule.default).toHaveBeenCalled();
      });
      it('can be set from router state', async () => {
        mockLocationState = MOCK_LOCATION_STATE_COMPLETE;
        render();
        await waitFor(() => {
          expect(currentSigninProps?.email).toBe(MOCK_ROUTER_STATE_EMAIL);
        });
        expect(SigninModule.default).toHaveBeenCalled();
      });
      it('if it matches email in local storage, session token in local storage is used', async () => {
        const storedAccount = {
          ...MOCK_STORED_ACCOUNT,
          email: MOCK_QUERY_PARAM_EMAIL,
          sessionToken: 'blabadee',
        };
        mockCurrentAccount(storedAccount);
        mockUseValidateModule();
        render();
        await waitFor(() => {
          expect(currentSigninProps?.email).toBe(MOCK_QUERY_PARAM_EMAIL);
        });
        await waitFor(() => {
          expect(currentSigninProps?.sessionToken).toBe(
            storedAccount.sessionToken
          );
        });
        expect(SigninModule.default).toHaveBeenCalled();
      });
      it('is handled if not provided in query params or location state', async () => {
        render();
        expect(CacheModule.currentAccount).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
        expect(SigninModule.default).not.toHaveBeenCalled();
      });
      it('uses local storage value if email is not provided via query param or router state', async () => {
        mockCurrentAccount(MOCK_STORED_ACCOUNT);
        render();
        expect(CacheModule.currentAccount).toHaveBeenCalled();
        await waitFor(() => {
          expect(currentSigninProps?.email).toBe(MOCK_STORED_ACCOUNT.email);
        });
        expect(SigninModule.default).toHaveBeenCalled();
      });
      it('falls back to last logged in account in local storage if current local storage account does not exist', async () => {
        const LAST_STORED_ACCOUNT = {
          ...MOCK_STORED_ACCOUNT,
          email: 'foo@bar.com',
        };
        jest
          .spyOn(CacheModule, 'lastStoredAccount')
          .mockReturnValue(LAST_STORED_ACCOUNT);
        mockCurrentAccount(undefined);
        render();
        expect(CacheModule.currentAccount).toHaveBeenCalled();
        expect(CacheModule.lastStoredAccount).toHaveBeenCalled();
        await waitFor(() => {
          expect(currentSigninProps?.email).toBe(LAST_STORED_ACCOUNT.email);
        });
        expect(SigninModule.default).toHaveBeenCalled();
      });
    });
    describe('loading spinner', () => {
      it('renders if hasLinkedAccount is undefined', async () => {
        // test against query params
        mockUseValidateModule({
          queryParams: {
            email: MOCK_QUERY_PARAM_EMAIL,
            hasPassword: 'true',
            isV2: () => false,
          },
        });
        render();
        await waitFor(() => {
          screen.getByLabelText('Loading…');
          expect(SigninModule.default).not.toHaveBeenCalled();
        });
      });
      it('renders if hasPassword is undefined', async () => {
        // test against router state
        mockLocationState = {
          email: MOCK_ROUTER_STATE_EMAIL,
          hasLinkedAccount: false,
        };
        render();
        await waitFor(() => {
          screen.getByLabelText('Loading…');
          expect(SigninModule.default).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('hasLinkedAccount or hasPassword is not provided', () => {
    it('accountStatusByEmail is called, email provided by query param', async () => {
      mockUseValidateModule({
        queryParams: {
          email: MOCK_QUERY_PARAM_EMAIL,
          hasLinkedAccount: 'true',
          isV2: () => false,
        },
      });
      render();
      await waitFor(() => {
        expect(mockAuthClient.accountStatusByEmail).toHaveBeenCalledWith(
          MOCK_QUERY_PARAM_EMAIL,
          { thirdPartyAuthStatus: true }
        );
      });
    });
    it('accountStatusByEmail is called, email provided by location state', async () => {
      mockLocationState = {
        email: MOCK_ROUTER_STATE_EMAIL,
        hasPassword: true,
      };
      render();
      await waitFor(() => {
        expect(mockAuthClient.accountStatusByEmail).toHaveBeenCalledWith(
          MOCK_ROUTER_STATE_EMAIL,
          { thirdPartyAuthStatus: true }
        );
      });
    });
    it('redirects to /signup if account does not exist', async () => {
      mockUseValidateModule({
        queryParams: { email: MOCK_QUERY_PARAM_EMAIL, isV2: () => false },
      });
      mockAuthClient.accountStatusByEmail = jest
        .fn()
        .mockResolvedValue({ exists: false });

      render();
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/signup', {
          state: { email: MOCK_QUERY_PARAM_EMAIL, emailStatusChecked: true },
        });
      });
    });
  });

  describe('hasLinkedAccount and hasPassword are provided', () => {
    it('accountStatusByEmail is not called, email provided by query params', async () => {
      mockUseValidateModule();
      render();
      await waitFor(() => {
        expect(mockAuthClient.accountStatusByEmail).not.toHaveBeenCalled();
      });
    });
    it('accountStatusByEmail is not called, email provided by location state', async () => {
      mockLocationState = MOCK_LOCATION_STATE_COMPLETE;
      render();
      await waitFor(() => {
        expect(mockAuthClient.accountStatusByEmail).not.toHaveBeenCalled();
      });
    });
  });

  describe('beginSigninHandler', () => {
    beforeEach(() => {
      mockLocationState = MOCK_LOCATION_STATE_COMPLETE;
    });

    it('runs handler and invokes sign in mutation', async () => {
      render();

      await waitFor(() => {
        expect(currentSigninProps).toBeDefined();
      });

      await waitFor(async () => {
        const handlerResult = await currentSigninProps?.beginSigninHandler(
          MOCK_EMAIL,
          MOCK_PASSWORD
        );
        // these come from createBeginSigninResponse
        expect(handlerResult?.data?.signIn?.uid).toEqual(MOCK_UID);
        expect(handlerResult?.data?.signIn?.sessionToken).toEqual(
          MOCK_SESSION_TOKEN
        );
        expect(handlerResult?.data?.signIn?.authAt).toEqual(MOCK_AUTH_AT);
        expect(handlerResult?.data?.signIn?.metricsEnabled).toEqual(true);
        expect(handlerResult?.data?.signIn?.emailVerified).toEqual(true);
        expect(handlerResult?.data?.signIn?.sessionVerified).toEqual(true);
        expect(handlerResult?.data?.signIn?.verificationMethod).toEqual(
          MOCK_VERIFICATION.verificationMethod
        );
        expect(handlerResult?.data?.signIn?.verificationReason).toEqual(
          MOCK_VERIFICATION.verificationReason
        );
        expect(storeAccountData).toHaveBeenCalled();
      });
    });

    describe('showInlineRecoveryKeySetup', () => {
      beforeEach(() => {
        mockSyncDesktopV3Integration();
        // Ensure early can_link_account check does not short‑circuit beginSigninHandler
        (ensureCanLinkAcountOrRedirect as jest.Mock).mockResolvedValue(true);
        mockLocationState = MOCK_LOCATION_STATE_CAN_LINK_ACCOUNT_OK;
        render();
      });
      it('calls recoveryKeyExists when expected and sets showInlineRecoveryKeySetup', async () => {
        expect(currentSigninProps).toBeDefined();
        let handlerResult: BeginSigninResult | undefined;
        await act(async () => {
          handlerResult = await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );
        });

        expect(mockSensitiveDataClient.setDataType).toHaveBeenCalledWith(
          SensitiveData.Key.Auth,
          {
            authPW: MOCK_AUTH_PW,
            emailForAuth: MOCK_EMAIL,
            unwrapBKey: MOCK_UNWRAP_BKEY,
            keyFetchToken: MOCK_KEY_FETCH_TOKEN,
          }
        );
        expect(mockAuthClient.recoveryKeyExists).toHaveBeenCalledWith(
          handlerResult?.data?.signIn.sessionToken,
          MOCK_EMAIL
        );

        expect(handlerResult?.data?.showInlineRecoveryKeySetup).toEqual(true);
      });

      it('does not call recoveryKeyExists or set showInlineRecoveryKeySetup when user has dismissed promo', async () => {
        localStorage.setItem(
          Constants.DISABLE_PROMO_ACCOUNT_RECOVERY_KEY_DO_IT_LATER,
          'true'
        );
        let handlerResult: BeginSigninResult | undefined;
        await act(async () => {
          handlerResult = await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );
        });

        expect(mockAuthClient.recoveryKeyExists).not.toHaveBeenCalled();
        expect(handlerResult?.data?.showInlineRecoveryKeySetup).toEqual(
          undefined
        );
        localStorage.clear();
      });
      it('sets showInlineRecoveryKeySetup to false when user has a recovery key', async () => {
        mockAuthClient.recoveryKeyExists = jest.fn().mockResolvedValue({
          exists: true,
        });
        let handlerResult: BeginSigninResult | undefined;
        await act(async () => {
          handlerResult = await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );
        });
        expect(mockAuthClient.recoveryKeyExists).toHaveBeenCalledWith(
          handlerResult?.data?.signIn.sessionToken,
          MOCK_EMAIL
        );
        expect(handlerResult?.data?.showInlineRecoveryKeySetup).toEqual(false);
      });
    });

    it('handles auth client error', async () => {
      // Mock signInWithAuthPW to throw an error
      mockAuthClient.signInWithAuthPW = jest.fn().mockRejectedValue({
        errno: AuthUiErrors.INCORRECT_PASSWORD.errno,
        message: AuthUiErrors.INCORRECT_PASSWORD.message,
      });

      render();

      await waitFor(async () => {
        const handlerResult = await currentSigninProps?.beginSigninHandler(
          MOCK_EMAIL,
          MOCK_PASSWORD
        );

        expect(handlerResult?.data).toBeUndefined();
        expect(handlerResult?.error?.message).toEqual(
          AuthUiErrors.INCORRECT_PASSWORD.message
        );
      });
    });

    it('handles incorrect email case error', async () => {
      const email = `orginal-${MOCK_EMAIL}`;
      const correctedEmail = `new-${MOCK_EMAIL}`;

      // First call should fail with incorrect email case error, then retry with corrected email
      let callCount = 0;
      mockAuthClient.signInWithAuthPW = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject({
            errno: AuthUiErrors.INCORRECT_EMAIL_CASE.errno,
            message: AuthUiErrors.INCORRECT_EMAIL_CASE.message,
            email: correctedEmail,
          });
        }
        return Promise.resolve({
          uid: MOCK_UID,
          sessionToken: MOCK_SESSION_TOKEN,
          authAt: MOCK_AUTH_AT,
          metricsEnabled: true,
          emailVerified: true,
          sessionVerified: false,
          verificationMethod: VerificationMethods.EMAIL_OTP,
          verificationReason: VerificationReasons.SIGN_IN,
          keyFetchToken: MOCK_KEY_FETCH_TOKEN,
        });
      });

      render();

      await waitFor(async () => {
        // Emulates providing the original email even after they swapped in a primary email.
        const handlerResult = await currentSigninProps?.beginSigninHandler(
          email,
          MOCK_PASSWORD
        );
        expect(handlerResult?.data).toBeDefined();
        expect(handlerResult?.error).toBeUndefined();
      });
    });

    describe('fxaCanLinkAccount', () => {
      beforeEach(() => {
        mockSyncDesktopV3Integration();
        (ensureCanLinkAcountOrRedirect as jest.Mock).mockResolvedValue(true);
      });
      afterEach(() => {
        (ensureCanLinkAcountOrRedirect as jest.Mock).mockRestore();
      });
      it('is not called when conditions are not met (query param)', async () => {
        // Simulate Index already accepted/auto-OKed the merge warning
        // avoids mocking ensureCanLinkAcountOrRedirect
        mockLocationState = { canLinkAccountOk: true };
        render();

        await waitFor(async () => {
          await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );
          expect(ensureCanLinkAcountOrRedirect).not.toHaveBeenCalled();
        });
      });

      it('calls ensureCanLinkAcountOrRedirect early without UID when conditions are met', async () => {
        mockLocationState = {
          hasLinkedAccount: undefined,
          email: MOCK_ROUTER_STATE_EMAIL,
        };
        render();

        await waitFor(async () => {
          const handlerResult = await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );

          expect(handlerResult?.data).toBeDefined();
        });
        expect(ensureCanLinkAcountOrRedirect).toHaveBeenCalledTimes(1);
        expect(ensureCanLinkAcountOrRedirect).toHaveBeenCalledWith(
          expect.objectContaining({
            email: MOCK_EMAIL,
          })
        );
        expect(ensureCanLinkAcountOrRedirect).toHaveBeenCalledWith(
          expect.not.objectContaining({
            uid: expect.anything(),
          })
        );
      });

      it('returns error when user cancels', async () => {
        mockLocationState = {
          hasLinkedAccount: undefined,
          email: MOCK_ROUTER_STATE_EMAIL,
        };
        (ensureCanLinkAcountOrRedirect as jest.Mock).mockResolvedValue(false);
        render();

        await waitFor(async () => {
          const handlerResult = await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );
          expect(handlerResult?.data).toBeUndefined();
        });
      });

      describe('with supportsCanLinkAccountUid capability and OAuthNative integration', () => {
        beforeEach(() => {
          mockOAuthNativeIntegration();
        });

        it('calls ensureCanLinkAcountOrRedirect with UID after successful signin', async () => {
          const useFxAStatusResult = mockUseFxAStatus({
            supportsCanLinkAccountUid: true,
          });

          render({ useFxAStatusResult });

          await waitFor(async () => {
            const handlerResult = await currentSigninProps?.beginSigninHandler(
              MOCK_EMAIL,
              MOCK_PASSWORD
            );

            expect(handlerResult?.data).toBeDefined();
            expect(handlerResult?.data?.signIn?.uid).toBe(MOCK_UID);
          });
          expect(ensureCanLinkAcountOrRedirect).toHaveBeenCalledTimes(1);
          expect(ensureCanLinkAcountOrRedirect).toHaveBeenCalledWith(
            expect.objectContaining({
              email: MOCK_EMAIL,
              uid: MOCK_UID,
            })
          );
        });
      });
    });

    describe('v2 key stretching', () => {
      beforeEach(() => {
        mockUseValidateModule({
          queryParams: {
            ...MOCK_QUERY_PARAM_MODEL,
            isV2: () => true,
          },
        });
      });

      it('runs handler and uses existing V2 credentials', async () => {
        // Mock getCredentialStatusV2 to return upgradeNeeded: false (already on v2)
        mockAuthClient.getCredentialStatusV2 = jest.fn().mockResolvedValue({
          upgradeNeeded: false,
          currentVersion: 'v2',
          clientSalt: MOCK_CLIENT_SALT,
        });
        // Mock signInWithAuthPW to return a successful session
        mockAuthClient.signInWithAuthPW = jest.fn().mockResolvedValue({
          uid: MOCK_UID,
          sessionToken: MOCK_SESSION_TOKEN,
          authAt: MOCK_AUTH_AT,
          metricsEnabled: true,
          emailVerified: true,
          sessionVerified: false,
          verificationMethod: VerificationMethods.EMAIL_OTP,
          verificationReason: VerificationReasons.SIGN_IN,
          keyFetchToken: MOCK_KEY_FETCH_TOKEN,
        });

        render();

        await waitFor(async () => {
          const handlerResult = await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );

          expect(handlerResult?.data?.signIn?.sessionToken).toEqual(
            MOCK_SESSION_TOKEN
          );
        });
      });

      it('runs handler and upgrades to new V2 credentials', async () => {
        // Mock getCredentialStatusV2 to return upgradeNeeded: true
        mockAuthClient.getCredentialStatusV2 = jest.fn().mockResolvedValue({
          upgradeNeeded: true,
          currentVersion: 'v1',
          clientSalt: MOCK_CLIENT_SALT,
        });
        // Mock signInWithAuthPW to return a verified session
        mockAuthClient.signInWithAuthPW = jest.fn().mockResolvedValue({
          uid: MOCK_UID,
          sessionToken: MOCK_SESSION_TOKEN,
          authAt: MOCK_AUTH_AT,
          metricsEnabled: true,
          emailVerified: true,
          sessionVerified: true,
          verificationMethod: VerificationMethods.EMAIL_OTP,
          verificationReason: VerificationReasons.SIGN_IN,
          keyFetchToken: MOCK_KEY_FETCH_TOKEN,
        });
        // Mock passwordChangeStartWithAuthPW to succeed
        mockAuthClient.passwordChangeStartWithAuthPW = jest.fn().mockResolvedValue({
          keyFetchToken: MOCK_KEY_FETCH_TOKEN,
          passwordChangeToken: 'mockPasswordChangeToken',
        });
        // Mock wrappedAccountKeys to succeed
        mockAuthClient.wrappedAccountKeys = jest.fn().mockResolvedValue({
          kA: MOCK_KB,
          wrapKB: MOCK_WRAP_KB,
        });
        // Mock passwordChangeFinish to succeed
        mockAuthClient.passwordChangeFinish = jest.fn().mockResolvedValue({});

        render();

        await waitFor(async () => {
          const handlerResult = await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );

          expect(handlerResult?.data?.signIn?.sessionToken).toEqual(
            MOCK_SESSION_TOKEN
          );
          expect(mockGetCredentials).toHaveBeenCalledWith(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );
          expect(mockGetCredentialsV2).toHaveBeenCalledWith({
            password: MOCK_PASSWORD,
            clientSalt: MOCK_CLIENT_SALT,
          });
          expect(mockGetKeysV2).toHaveBeenCalledWith({
            kB: await CryptoModule.unwrapKB(MOCK_WRAP_KB, MOCK_UNWRAP_BKEY),
            v1: {
              authPW: MOCK_AUTH_PW,
              unwrapBKey: MOCK_UNWRAP_BKEY,
            },
            v2: {
              authPW: MOCK_AUTH_PW_V2,
              unwrapBKey: MOCK_UNWRAP_BKEY_V2,
              clientSalt: MOCK_CLIENT_SALT,
            },
          });
          expect(mockUnwrapKB).toHaveBeenCalledWith(
            MOCK_WRAP_KB,
            MOCK_UNWRAP_BKEY
          );
        });
      });

      it('handles error fetching credentials status', async () => {
        // Mock getCredentialStatusV2 to throw an error
        mockAuthClient.getCredentialStatusV2 = jest.fn().mockRejectedValue({
          errno: 999,
          message: 'Test error',
        });

        render();

        await waitFor(async () => {
          const handlerResult = await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );

          expect(handlerResult?.error).toBeUndefined();
          expect(handlerResult?.data?.signIn).toBeDefined();
          expect(mockSentryCaptureMessage).toHaveBeenCalledWith(
            'Failure to finish v2 key-stretching upgrade. Could not get credential status during signin',
            { tags: { errno: 999 } }
          );
        });
      });

      it('handles error when starting upgrade', async () => {
        // Mock getCredentialStatusV2 to return upgradeNeeded: true
        mockAuthClient.getCredentialStatusV2 = jest.fn().mockResolvedValue({
          upgradeNeeded: true,
          currentVersion: 'v1',
          clientSalt: '',
        });
        // Mock signInWithAuthPW to return verified session
        mockAuthClient.signInWithAuthPW = jest.fn().mockResolvedValue({
          uid: MOCK_UID,
          sessionToken: MOCK_SESSION_TOKEN,
          authAt: MOCK_AUTH_AT,
          metricsEnabled: true,
          emailVerified: true,
          sessionVerified: true,
          verificationMethod: VerificationMethods.EMAIL_OTP,
          verificationReason: VerificationReasons.SIGN_IN,
          keyFetchToken: MOCK_KEY_FETCH_TOKEN,
        });
        // Mock passwordChangeStartWithAuthPW to throw an error
        mockAuthClient.passwordChangeStartWithAuthPW = jest.fn().mockRejectedValue({
          errno: 999,
          message: 'Test error',
        });

        render();

        await waitFor(async () => {
          const handlerResult = await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );
          expect(handlerResult?.error).toBeUndefined();
          expect(handlerResult?.data?.signIn).toBeDefined();
          expect(mockSentryCaptureMessage).toHaveBeenCalledWith(
            'Failure to finish v2 key-stretching upgrade. Could not start password change during signin',
            { tags: { errno: 999 } }
          );
        });
      });

      it('handles error when fetching keys', async () => {
        // Mock getCredentialStatusV2 to return upgradeNeeded: true
        mockAuthClient.getCredentialStatusV2 = jest.fn().mockResolvedValue({
          upgradeNeeded: true,
          currentVersion: 'v1',
          clientSalt: '',
        });
        // Mock signInWithAuthPW to return verified session
        mockAuthClient.signInWithAuthPW = jest.fn().mockResolvedValue({
          uid: MOCK_UID,
          sessionToken: MOCK_SESSION_TOKEN,
          authAt: MOCK_AUTH_AT,
          metricsEnabled: true,
          emailVerified: true,
          sessionVerified: true,
          verificationMethod: VerificationMethods.EMAIL_OTP,
          verificationReason: VerificationReasons.SIGN_IN,
          keyFetchToken: MOCK_KEY_FETCH_TOKEN,
        });
        // Mock passwordChangeStartWithAuthPW to succeed
        mockAuthClient.passwordChangeStartWithAuthPW = jest.fn().mockResolvedValue({
          keyFetchToken: MOCK_KEY_FETCH_TOKEN,
          passwordChangeToken: 'mockPasswordChangeToken',
        });
        // Mock wrappedAccountKeys to throw an error
        mockAuthClient.wrappedAccountKeys = jest.fn().mockRejectedValue({
          errno: 999,
          message: 'Test error',
        });

        render();

        await waitFor(async () => {
          const handlerResult = await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );
          expect(handlerResult?.error?.message).toBeUndefined();
          expect(handlerResult?.data?.signIn).toBeDefined();
          expect(mockSentryCaptureMessage).toHaveBeenCalledTimes(1);
          expect(mockSentryCaptureMessage).toHaveBeenCalledWith(
            'Failure to finish v2 key-stretching upgrade. Could not get wrapped keys during signin',
            { tags: { errno: 999 } }
          );
        });
      });

      it('handles error when finishing password upgrade', async () => {
        // Mock getCredentialStatusV2 to return upgradeNeeded: true
        mockAuthClient.getCredentialStatusV2 = jest.fn().mockResolvedValue({
          upgradeNeeded: true,
          currentVersion: 'v1',
          clientSalt: '',
        });
        // Mock signInWithAuthPW to return verified session
        mockAuthClient.signInWithAuthPW = jest.fn().mockResolvedValue({
          uid: MOCK_UID,
          sessionToken: MOCK_SESSION_TOKEN,
          authAt: MOCK_AUTH_AT,
          metricsEnabled: true,
          emailVerified: true,
          sessionVerified: true,
          verificationMethod: VerificationMethods.EMAIL_OTP,
          verificationReason: VerificationReasons.SIGN_IN,
          keyFetchToken: MOCK_KEY_FETCH_TOKEN,
        });
        // Mock passwordChangeStartWithAuthPW to succeed
        mockAuthClient.passwordChangeStartWithAuthPW = jest.fn().mockResolvedValue({
          keyFetchToken: MOCK_KEY_FETCH_TOKEN,
          passwordChangeToken: 'mockPasswordChangeToken',
        });
        // Mock wrappedAccountKeys to succeed
        mockAuthClient.wrappedAccountKeys = jest.fn().mockResolvedValue({
          kA: MOCK_KB,
          wrapKB: MOCK_WRAP_KB,
        });
        // Mock passwordChangeFinish to throw an error
        mockAuthClient.passwordChangeFinish = jest.fn().mockRejectedValue({
          errno: 999,
          message: 'Test error',
        });

        render();

        await waitFor(async () => {
          const handlerResult = await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );
          expect(handlerResult?.error?.message).toBeUndefined();
          expect(handlerResult?.data?.signIn).toBeDefined();
          expect(mockSentryCaptureMessage).toHaveBeenCalledTimes(1);
          expect(mockSentryCaptureMessage).toHaveBeenCalledWith(
            'Failure to finish v2 key-stretching upgrade. Could not finish password change during signin',
            { tags: { errno: 999 } }
          );
        });
      });

      it('handles unverified accounts', async () => {
        // Note, we cannot automatically upgrade unverified accounts, because the
        // reset password mechanism won't work in this case, so we want to fallback
        // to using V1 credentials in this scenario.
        (ModelsModule.useSession as jest.Mock).mockImplementation(() => ({
          ...mockSession,
          isSessionVerified: jest.fn().mockResolvedValue(false),
        }));
        // Mock getCredentialStatusV2 to return upgradeNeeded: true
        mockAuthClient.getCredentialStatusV2 = jest.fn().mockResolvedValue({
          upgradeNeeded: true,
          currentVersion: 'v1',
          clientSalt: '',
        });
        // Mock signInWithAuthPW to return unverified session
        mockAuthClient.signInWithAuthPW = jest.fn().mockResolvedValue({
          uid: MOCK_UID,
          sessionToken: MOCK_SESSION_TOKEN,
          authAt: MOCK_AUTH_AT,
          metricsEnabled: true,
          emailVerified: false,
          sessionVerified: false,
          verificationMethod: VerificationMethods.EMAIL_OTP,
          verificationReason: VerificationReasons.SIGN_IN,
          keyFetchToken: MOCK_KEY_FETCH_TOKEN,
        });

        render();

        await waitFor(async () => {
          const handlerResult = await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );
          expect(handlerResult?.error).toBeUndefined();
          expect(mockSentryCaptureMessage).toHaveBeenCalledTimes(0);
          expect(handlerResult?.data?.signIn?.sessionToken).toEqual(
            MOCK_SESSION_TOKEN
          );
        });
      });
    });
  });

  describe('cachedSigninHandler', () => {
    beforeEach(() => {
      mockCurrentAccount(MOCK_STORED_ACCOUNT);
    });

    it('runs handler, calls accountProfile and recoveryEmailStatus', async () => {
      // Reset session mock for this test
      mockSession.sendVerificationCode.mockClear();

      mockAuthClient.accountProfile = jest.fn().mockResolvedValue({
        authenticationMethods: ['pwd', 'email'],
        authenticatorAssuranceLevel: 1,
      });
      mockAuthClient.sessionStatus = jest.fn().mockResolvedValue({
        details: {
          accountEmailVerified: true,
          sessionVerified: false,
        },
      });

      mockUseValidateModule();
      render();

      await waitFor(() => {
        expect(currentSigninProps?.email).toBe(MOCK_QUERY_PARAM_EMAIL);
      });

      await waitFor(async () => {
        const handlerResult =
          await currentSigninProps?.cachedSigninHandler(MOCK_SESSION_TOKEN);

        expect(mockAuthClient.accountProfile).toHaveBeenCalledWith(
          MOCK_SESSION_TOKEN
        );
        expect(mockAuthClient.sessionStatus).toHaveBeenCalledWith(
          MOCK_SESSION_TOKEN
        );
        expect(mockSession.sendVerificationCode).toHaveBeenCalled();
        expect(handlerResult?.data?.verificationMethod).toEqual(
          VerificationMethods.EMAIL_OTP
        );

        expect(handlerResult?.data?.verificationReason).toEqual(
          VerificationReasons.SIGN_IN
        );
        expect(handlerResult?.data?.sessionVerified).toEqual(false);
        expect(handlerResult?.data?.emailVerified).toEqual(true);
      });
    });

    it('handles unverified email', async () => {
      // Reset session mock for this test
      mockSession.sendVerificationCode.mockClear();

      mockAuthClient.accountProfile = jest.fn().mockResolvedValue({
        authenticationMethods: ['pwd', 'email'],
        authenticatorAssuranceLevel: 1,
      });
      mockAuthClient.sessionStatus = jest.fn().mockResolvedValue({
        details: {
          accountEmailVerified: false,
          sessionVerified: false,
        },
      });

      mockUseValidateModule();
      render();

      await waitFor(async () => {
        const handlerResult =
          await currentSigninProps?.cachedSigninHandler(MOCK_SESSION_TOKEN);

        expect(mockSession.sendVerificationCode).toHaveBeenCalled();
        expect(handlerResult?.data?.verificationMethod).toEqual(
          VerificationMethods.EMAIL_OTP
        );
        expect(handlerResult?.data?.verificationReason).toEqual(
          VerificationReasons.SIGN_UP
        );
        expect(handlerResult?.data?.sessionVerified).toEqual(false);
        expect(handlerResult?.data?.emailVerified).toEqual(false);
      });
    });

    it('handles unverified session with TOTP enabled', async () => {
      // Reset session mock for this test
      mockSession.sendVerificationCode.mockClear();

      mockAuthClient.accountProfile = jest.fn().mockResolvedValue({
        authenticationMethods: ['pwd', 'email', 'otp'],
        authenticatorAssuranceLevel: 2, // max account assurance level is 2fa
      });
      mockAuthClient.sessionStatus = jest.fn().mockResolvedValue({
        details: {
          accountEmailVerified: true,
          sessionVerified: false,
        },
      });

      mockUseValidateModule();
      render();

      await waitFor(async () => {
        const handlerResult =
          await currentSigninProps?.cachedSigninHandler(MOCK_SESSION_TOKEN);

        expect(mockSession.sendVerificationCode).not.toHaveBeenCalled();
        expect(handlerResult?.data?.verificationMethod).toEqual(
          VerificationMethods.TOTP_2FA
        );
        expect(handlerResult?.data?.verificationReason).toEqual(
          VerificationReasons.SIGN_IN
        );
        expect(handlerResult?.data?.sessionVerified).toEqual(false);
        expect(handlerResult?.data?.emailVerified).toEqual(true);
      });
    });

    it('does not return a verification reason with verified 2FA session', async () => {
      // Reset session mock for this test
      mockSession.sendVerificationCode.mockClear();

      mockAuthClient.accountProfile = jest.fn().mockResolvedValue({
        authenticationMethods: ['pwd', 'email', 'otp'],
        authenticatorAssuranceLevel: 2, // 2FA verified session
      });
      mockAuthClient.sessionStatus = jest.fn().mockResolvedValue({
        details: {
          accountEmailVerified: true,
          sessionVerified: true,
        },
      });

      mockUseValidateModule();
      render();

      await waitFor(async () => {
        const handlerResult =
          await currentSigninProps?.cachedSigninHandler(MOCK_SESSION_TOKEN);

        expect(mockSession.sendVerificationCode).not.toHaveBeenCalled();
        expect(handlerResult?.data?.verificationMethod).toBeUndefined();
        expect(handlerResult?.data?.verificationReason).toBeUndefined();
        expect(handlerResult?.data?.emailVerified).toEqual(true);
      });
    });

    it('handles invalid token error', async () => {
      mockAuthClient.accountProfile = jest
        .fn()
        .mockRejectedValue(AuthUiErrors.INVALID_TOKEN);

      mockUseValidateModule();
      render();

      await waitFor(async () => {
        const handlerResult =
          await currentSigninProps?.cachedSigninHandler(MOCK_SESSION_TOKEN);
        expect(CacheModule.discardSessionToken).toHaveBeenCalled();
        expect(handlerResult?.data).toBeUndefined();
        expect(handlerResult?.error?.errno).toEqual(
          AuthUiErrors.SESSION_EXPIRED.errno
        );
        expect(handlerResult?.error?.message).toEqual(
          AuthUiErrors.SESSION_EXPIRED.message
        );
      });
    });

    it('handles other errors', async () => {
      mockAuthClient.sessionStatus = jest
        .fn()
        .mockRejectedValue(AuthUiErrors.UNEXPECTED_ERROR);
      mockUseValidateModule();
      render();

      await waitFor(async () => {
        const handlerResult =
          await currentSigninProps?.cachedSigninHandler(MOCK_SESSION_TOKEN);

        expect(CacheModule.discardSessionToken).not.toHaveBeenCalled();
        expect(handlerResult?.data).toBeUndefined();
        expect(handlerResult?.error).toEqual(AuthUiErrors.UNEXPECTED_ERROR);
      });
    });
  });

  /**
   * These tests trigger the `setAccountStatus` useEffect, and because of the IIFE
   * inside that, and because there are no `waitFor` calls, they need to explicitly await
   * the `render` with `act(...)`
   */
  describe('query parameter check', () => {
    let useValidatedQueryParamsSpy: jest.SpyInstance;

    /**
     * This is a bit odd, but because of the async IIFE we have to
     * double wrap the `render` call in `act(...)` to ensure
     * the initial render is complete, then the async IIFE completes.
     */
    async function setupContainer() {
      let container;
      await act(async () => {
        await act(() => (container = render()));
      });
      return container;
    }

    beforeEach(() => {
      useValidatedQueryParamsSpy = mockUseValidateModule({
        queryParams: {
          email: MOCK_QUERY_PARAM_EMAIL,
          hasPassword: 'true',
          isV2: () => false,
        },
      });
    });

    it('should check query parameters', async () => {
      mockWebIntegration();

      const container = await setupContainer();

      expect(container).toBeDefined();

      expect(useValidatedQueryParamsSpy).toHaveBeenCalledWith(
        SigninQueryParams,
        true
      );
      expect(useValidatedQueryParamsSpy).toHaveBeenCalledWith(
        OAuthQueryParams,
        true,
        true
      );
      expect(useValidatedQueryParamsSpy).toHaveBeenCalledWith(
        OAuthNativeSyncQueryParameters,
        true,
        true
      );
    });

    it('should validate oauth query parameters', async () => {
      mockOAuthWebIntegration();

      const container = await setupContainer();

      expect(container).toBeDefined();
      expect(useValidatedQueryParamsSpy).toHaveBeenCalledWith(
        SigninQueryParams,
        true
      );
      expect(useValidatedQueryParamsSpy).toHaveBeenCalledWith(
        OAuthQueryParams,
        true,
        false
      );
      expect(useValidatedQueryParamsSpy).toHaveBeenCalledWith(
        OAuthNativeSyncQueryParameters,
        true,
        true
      );
    });

    it('should validate oauth native sync query parameters', async () => {
      mockOAuthNativeIntegration();

      const container = await setupContainer();

      expect(container).toBeDefined();
      expect(useValidatedQueryParamsSpy).toHaveBeenCalledWith(
        SigninQueryParams,
        true
      );
      expect(useValidatedQueryParamsSpy).toHaveBeenCalledWith(
        OAuthQueryParams,
        true,
        false
      );
      expect(useValidatedQueryParamsSpy).toHaveBeenCalledWith(
        OAuthNativeSyncQueryParameters,
        true,
        false
      );
    });
  });
});
