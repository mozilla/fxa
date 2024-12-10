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

import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';
import { LocationProvider } from '@reach/router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import SigninContainer from './container';
import { BeginSigninResult, SigninProps } from './interfaces';
import { MozServices } from '../../lib/types';
import { act, screen, waitFor } from '@testing-library/react';
import { ModelDataProvider } from '../../lib/model-data';
import { IntegrationType } from '../../models';
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
  mockBeginSigninMutationWithV2Password,
  mockGqlAvatarUseQuery,
  mockGqlBeginSigninMutation,
  mockGqlCredentialStatusMutation,
  mockGqlError,
  mockGqlGetAccountKeysMutation,
  mockGqlPasswordChangeFinishMutation,
  mockGqlPasswordChangeStartMutation,
  MOCK_FLOW_ID,
  MOCK_CLIENT_ID,
  MOCK_KEY_FETCH_TOKEN,
} from './mocks';
import AuthClient from 'fxa-auth-client/browser';
import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { Integration } from '../../models';
import { firefox } from '../../lib/channels/firefox';
import { mockSensitiveDataClient as createMockSensitiveDataClient } from '../../models/mocks';
import { SensitiveData } from '../../lib/sensitive-data-client';
import { Constants } from '../../lib/constants';

jest.mock('../../lib/channels/firefox', () => ({
  ...jest.requireActual('../../lib/channels/firefox'),
  firefox: {
    fxaCanLinkAccount: jest.fn(),
  },
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
    isDesktopRelay: () => false,
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
    isDesktopRelay: () => false,
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
    isDesktopRelay: () => false,
  } as Integration;
}

function mockWebIntegration() {
  integration = {
    type: IntegrationType.Web,
    getService: () => MozServices.Default,
    getClientId: () => undefined,
    isSync: () => false,
    wantsKeys: () => false,
    isDesktopSync: () => false,
    isDesktopRelay: () => false,
    data: {},
  } as Integration;
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
  mockCurrentAccount();
  mockCryptoModule();
  mockSentryModule();
}

jest.mock('../../models', () => {
  return {
    ...jest.requireActual('../../models'),
    useAuthClient: jest.fn(),
    useSensitiveDataClient: jest.fn(),
    useConfig: jest.fn(),
  };
});
const mockAuthClient = new AuthClient('http://localhost:9000', {
  keyStretchVersion: 1,
});
const mockSensitiveDataClient = createMockSensitiveDataClient();
mockSensitiveDataClient.setDataType = jest.fn();

function mockModelsModule() {
  mockAuthClient.accountStatusByEmail = jest.fn().mockResolvedValue({
    exists: true,
    hasLinkedAccount: false,
    hasPassword: true,
  });
  mockAuthClient.accountProfile = jest
    .fn()
    .mockResolvedValue({ authenticationMethods: ['pwd', 'email'] });
  mockAuthClient.recoveryEmailStatus = jest.fn().mockResolvedValue({
    verified: true,
    sessionVerified: true,
    emailVerified: true,
  });
  mockAuthClient.recoveryKeyExists = jest.fn().mockResolvedValue({
    exists: false,
  });
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
  }));
}

// Call this when testing local storage
function mockCurrentAccount(storedAccount = { uid: '123' }) {
  jest.spyOn(CacheModule, 'currentAccount').mockReturnValue(storedAccount);
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
  jest.spyOn(UseValidateModule, 'useValidatedQueryParams').mockReturnValue({
    queryParamModel,
    validationError: undefined,
  });
}

const MOCK_ROUTER_STATE_EMAIL = 'from@routerstate.com';
const MOCK_LOCATION_STATE_COMPLETE = {
  email: MOCK_ROUTER_STATE_EMAIL,
  hasPassword: true,
  hasLinkedAccount: false,
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

function render(mocks: Array<MockedResponse>) {
  loadDevMessages();
  loadErrorMessages();

  renderWithLocalizationProvider(
    <MockedProvider mocks={mocks} addTypename={false}>
      <LocationProvider>
        <SigninContainer
          {...{
            integration,
            serviceName: MozServices.Default,
          }}
          flowQueryParams={{ flowId: MOCK_FLOW_ID }}
        />
      </LocationProvider>
    </MockedProvider>
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
        render([mockGqlAvatarUseQuery()]);
        await waitFor(() => {
          expect(currentSigninProps?.email).toBe(MOCK_QUERY_PARAM_EMAIL);
        });
        expect(SigninModule.default).toBeCalled();
      });
      it('router state takes precendence over query param state', async () => {
        mockUseValidateModule();
        mockLocationState = MOCK_LOCATION_STATE_COMPLETE;
        render([mockGqlAvatarUseQuery()]);
        await waitFor(() => {
          expect(currentSigninProps?.email).toBe(MOCK_ROUTER_STATE_EMAIL);
        });
        expect(SigninModule.default).toBeCalled();
      });
      it('can be set from router state', async () => {
        mockLocationState = MOCK_LOCATION_STATE_COMPLETE;
        render([mockGqlAvatarUseQuery()]);
        await waitFor(() => {
          expect(currentSigninProps?.email).toBe(MOCK_ROUTER_STATE_EMAIL);
        });
        expect(SigninModule.default).toBeCalled();
      });
      it('if it matches email in local storage, session token in local storage is used', async () => {
        const storedAccount = {
          ...MOCK_STORED_ACCOUNT,
          email: MOCK_QUERY_PARAM_EMAIL,
          sessionToken: 'blabadee',
        };
        mockCurrentAccount(storedAccount);
        mockUseValidateModule();
        render([mockGqlAvatarUseQuery()]);
        await waitFor(() => {
          expect(currentSigninProps?.email).toBe(MOCK_QUERY_PARAM_EMAIL);
        });
        await waitFor(() => {
          expect(currentSigninProps?.sessionToken).toBe(
            storedAccount.sessionToken
          );
        });
        expect(SigninModule.default).toBeCalled();
      });
      it('is handled if not provided in query params or location state', async () => {
        render([mockGqlAvatarUseQuery()]);
        expect(CacheModule.currentAccount).not.toBeCalled();
        expect(ReactUtils.hardNavigate).toBeCalledWith('/');
        expect(SigninModule.default).not.toBeCalled();
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
        render([mockGqlAvatarUseQuery()]);
        await waitFor(() => {
          screen.getByLabelText('Loading…');
          expect(SigninModule.default).not.toBeCalled();
        });
      });
      it('renders if hasPassword is undefined', async () => {
        // test against router state
        mockLocationState = {
          email: MOCK_ROUTER_STATE_EMAIL,
          hasLinkedAccount: false,
        };
        render([mockGqlAvatarUseQuery()]);
        await waitFor(() => {
          screen.getByLabelText('Loading…');
          expect(SigninModule.default).not.toBeCalled();
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
      render([mockGqlAvatarUseQuery()]);
      await waitFor(() => {
        expect(mockAuthClient.accountStatusByEmail).toBeCalledWith(
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
      render([mockGqlAvatarUseQuery()]);
      await waitFor(() => {
        expect(mockAuthClient.accountStatusByEmail).toBeCalledWith(
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

      render([mockGqlAvatarUseQuery()]);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          `/signup?email=from%40queryparams.com&emailStatusChecked=true`
        );
      });
    });
  });

  describe('hasLinkedAccount and hasPassword are provided', () => {
    it('accountStatusByEmail is not called, email provided by query params', async () => {
      mockUseValidateModule();
      render([mockGqlAvatarUseQuery()]);
      await waitFor(() => {
        expect(mockAuthClient.accountStatusByEmail).not.toHaveBeenCalled();
      });
    });
    it('accountStatusByEmail is not called, email provided by location state', async () => {
      mockLocationState = MOCK_LOCATION_STATE_COMPLETE;
      render([mockGqlAvatarUseQuery()]);
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
      render([
        mockGqlAvatarUseQuery(),
        mockGqlBeginSigninMutation({ keys: false }),
      ]);

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
        expect(handlerResult?.data?.signIn?.verified).toEqual(true);
        expect(handlerResult?.data?.signIn?.verificationMethod).toEqual(
          MOCK_VERIFICATION.verificationMethod
        );
        expect(handlerResult?.data?.signIn?.verificationReason).toEqual(
          MOCK_VERIFICATION.verificationReason
        );
      });
    });

    describe('showInlineRecoveryKeySetup', () => {
      beforeEach(() => {
        mockSyncDesktopV3Integration();
        // this puts hasLinkedAccount=false in the query params to avoid more canLinkAccount mocking
        mockUseValidateModule();
        render([
          mockGqlAvatarUseQuery(),
          mockGqlCredentialStatusMutation({
            currentVersion: 'v2',
            upgradeNeeded: false,
            clientSalt: MOCK_CLIENT_SALT,
          }),
          mockGqlBeginSigninMutation({ keys: true, service: 'sync' }),
        ]);
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

        expect(mockSensitiveDataClient.setDataType).toBeCalledWith(
          SensitiveData.Key.Auth,
          {
            authPW: MOCK_AUTH_PW,
            emailForAuth: MOCK_EMAIL,
            unwrapBKey: MOCK_UNWRAP_BKEY,
            keyFetchToken: MOCK_KEY_FETCH_TOKEN,
          }
        );
        expect(mockAuthClient.recoveryKeyExists).toBeCalledWith(
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

        expect(mockAuthClient.recoveryKeyExists).not.toBeCalled();
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
        expect(mockAuthClient.recoveryKeyExists).toBeCalledWith(
          handlerResult?.data?.signIn.sessionToken,
          MOCK_EMAIL
        );
        expect(handlerResult?.data?.showInlineRecoveryKeySetup).toEqual(false);
      });
    });

    it('handles gql mutation error', async () => {
      await render([
        mockGqlAvatarUseQuery(),
        {
          ...mockGqlBeginSigninMutation({ keys: false }),
          error: mockGqlError(AuthUiErrors.INCORRECT_PASSWORD),
        },
      ]);

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
      await render([
        mockGqlAvatarUseQuery(),
        // The first call should fail, and the incorrect email case error
        // with the corrected email in the error response should be returned.
        {
          ...mockGqlBeginSigninMutation({ keys: false }, { email: email }),
          error: mockGqlError(AuthUiErrors.INCORRECT_EMAIL_CASE, {
            email: correctedEmail,
          }),
        },
        // Note, that originalEmail should also be sent up. This is a requirement for v1 passwords!
        mockGqlBeginSigninMutation(
          { keys: false, originalLoginEmail: email },
          { email: correctedEmail }
        ),
      ]);

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
      });
      afterEach(() => {
        (firefox.fxaCanLinkAccount as jest.Mock).mockRestore();
      });
      it('is not called when conditions are not met (query param)', async () => {
        // this puts hasLinkedAccount=false in the query params
        // We don't want this called when the user was prompted on email-first
        mockUseValidateModule();
        (firefox.fxaCanLinkAccount as jest.Mock).mockImplementationOnce(
          async () => ({
            ok: true,
          })
        );
        render([
          mockGqlAvatarUseQuery(),
          mockGqlCredentialStatusMutation({
            currentVersion: 'v2',
            upgradeNeeded: false,
            clientSalt: MOCK_CLIENT_SALT,
          }),
          mockGqlBeginSigninMutation(
            { keys: true, service: 'sync' },
            { email: MOCK_EMAIL }
          ),
        ]);

        await waitFor(async () => {
          await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );
          expect(firefox.fxaCanLinkAccount).not.toHaveBeenCalled();
        });
      });
      it('is not called when conditions are not met (oauth web integration)', async () => {
        mockOAuthWebIntegration({ data: {} });
        (firefox.fxaCanLinkAccount as jest.Mock).mockImplementationOnce(
          async () => ({
            ok: true,
          })
        );
        render([mockGqlAvatarUseQuery()]);

        await waitFor(async () => {
          await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );
          expect(firefox.fxaCanLinkAccount).not.toHaveBeenCalled();
        });
      });
      it('calls fxaCanLinkAccount when conditions are met (oauth native integration, isSyncDesktop)', async () => {
        mockOAuthNativeIntegration();
        (firefox.fxaCanLinkAccount as jest.Mock).mockImplementationOnce(
          async () => ({
            ok: true,
          })
        );
        render([mockGqlAvatarUseQuery()]);

        await waitFor(async () => {
          await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );
          expect(firefox.fxaCanLinkAccount).not.toHaveBeenCalled();
        });
      });
      it('calls fxaCanLinkAccount when conditions are met', async () => {
        (firefox.fxaCanLinkAccount as jest.Mock).mockImplementationOnce(
          async () => ({
            ok: true,
          })
        );
        render([
          mockGqlAvatarUseQuery(),
          mockGqlCredentialStatusMutation({
            currentVersion: 'v2',
            upgradeNeeded: false,
            clientSalt: MOCK_CLIENT_SALT,
          }),
          mockGqlBeginSigninMutation(
            { keys: true, service: 'sync' },
            { email: MOCK_EMAIL }
          ),
        ]);

        await waitFor(async () => {
          await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );
          expect(firefox.fxaCanLinkAccount).toHaveBeenCalledWith({
            email: MOCK_EMAIL,
          });
        });
      });

      it('returns expected error when fxaCanLinkAccount response is !ok', async () => {
        (firefox.fxaCanLinkAccount as jest.Mock).mockImplementationOnce(
          async () => ({
            ok: false,
          })
        );
        render([mockGqlAvatarUseQuery()]);

        await waitFor(async () => {
          const handlerResult = await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );
          expect(handlerResult?.data).toBeUndefined();
          expect(handlerResult?.error?.errno).toEqual(1001);
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
        render([
          mockGqlAvatarUseQuery(),
          (() => {
            const mock = mockGqlCredentialStatusMutation();
            mock.result.data.credentialStatus.upgradeNeeded = false;
            return mock;
          })(),
          mockBeginSigninMutationWithV2Password(),
        ]);

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
        render([
          mockGqlAvatarUseQuery(),
          mockGqlCredentialStatusMutation(),
          mockGqlPasswordChangeStartMutation(),
          mockGqlGetAccountKeysMutation(),
          mockGqlPasswordChangeFinishMutation(),
          mockBeginSigninMutationWithV2Password(),
        ]);

        await waitFor(async () => {
          const handlerResult = await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );

          expect(handlerResult?.data?.signIn?.sessionToken).toEqual(
            MOCK_SESSION_TOKEN
          );
          expect(mockGetCredentials).toBeCalledWith(MOCK_EMAIL, MOCK_PASSWORD);
          expect(mockGetCredentialsV2).toBeCalledWith({
            password: MOCK_PASSWORD,
            clientSalt: MOCK_CLIENT_SALT,
          });
          expect(mockGetKeysV2).toBeCalledWith({
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
          expect(mockUnwrapKB).toBeCalledWith(MOCK_WRAP_KB, MOCK_UNWRAP_BKEY);
        });
      });

      it('handles error fetching credentials status', async () => {
        render([
          mockGqlAvatarUseQuery(),
          {
            ...mockGqlCredentialStatusMutation(),
            error: mockGqlError(),
          },
          mockGqlBeginSigninMutation({ keys: false }, { email: MOCK_EMAIL }),
        ]);

        await waitFor(async () => {
          const handlerResult = await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );

          expect(handlerResult?.error).toBeUndefined();
          expect(handlerResult?.data?.signIn).toBeDefined();
          expect(mockSentryCaptureMessage).toBeCalledWith(
            'Failure to finish v2 key-stretching upgrade. Could not get credential status during signin',
            { tags: { errno: 999 } }
          );
        });
      });

      it('handles error when starting upgrade', async () => {
        render([
          mockGqlAvatarUseQuery(),
          mockGqlCredentialStatusMutation({
            upgradeNeeded: true,
            currentVersion: 'v1',
            clientSalt: '',
          }),
          mockGqlBeginSigninMutation({ keys: false }, {}, { verified: true }),
          {
            ...mockGqlPasswordChangeStartMutation(),
            error: mockGqlError(),
          },
        ]);

        await waitFor(async () => {
          const handlerResult = await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );
          expect(handlerResult?.error).toBeUndefined();
          expect(handlerResult?.data?.signIn).toBeDefined();
          expect(mockSentryCaptureMessage).toBeCalledWith(
            'Failure to finish v2 key-stretching upgrade. Could not start password change during signin',
            { tags: { errno: 999 } }
          );
        });
      });

      it('handles error when fetching keys', async () => {
        render([
          mockGqlAvatarUseQuery(),
          mockGqlCredentialStatusMutation({
            upgradeNeeded: true,
            currentVersion: 'v1',
            clientSalt: '',
          }),
          mockGqlBeginSigninMutation({ keys: false }, {}, { verified: true }),
          mockGqlPasswordChangeStartMutation(),
          {
            ...mockGqlGetAccountKeysMutation(),
            error: mockGqlError(),
          },
        ]);

        await waitFor(async () => {
          const handlerResult = await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );
          expect(handlerResult?.error?.message).toBeUndefined();
          expect(handlerResult?.data?.signIn).toBeDefined();
          expect(mockSentryCaptureMessage).toBeCalledTimes(1);
          expect(mockSentryCaptureMessage).toBeCalledWith(
            'Failure to finish v2 key-stretching upgrade. Could not get wrapped keys during signin',
            { tags: { errno: 999 } }
          );
        });
      });

      it('handles error when finishing password upgrade', async () => {
        render([
          mockGqlAvatarUseQuery(),
          mockGqlCredentialStatusMutation({
            upgradeNeeded: true,
            currentVersion: 'v1',
            clientSalt: '',
          }),
          mockGqlBeginSigninMutation({ keys: false }, {}, { verified: true }),
          mockGqlPasswordChangeStartMutation(),
          mockGqlGetAccountKeysMutation(),
          {
            ...mockGqlPasswordChangeFinishMutation(),
            error: mockGqlError(),
          },
        ]);

        await waitFor(async () => {
          const handlerResult = await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );
          expect(handlerResult?.error?.message).toBeUndefined();
          expect(handlerResult?.data?.signIn).toBeDefined();
          expect(mockSentryCaptureMessage).toBeCalledTimes(1);
          expect(mockSentryCaptureMessage).toBeCalledWith(
            'Failure to finish v2 key-stretching upgrade. Could not finish password change during signin',
            { tags: { errno: 999 } }
          );
        });
      });

      it('handles unverified accounts', async () => {
        // Note, we cannot automatically upgrade unverified accounts, because the
        // reset password mechanism won't work in this case, so we want to fallback
        // to using V1 credentials in this scenario.
        render([
          mockGqlAvatarUseQuery(),
          mockGqlCredentialStatusMutation({
            upgradeNeeded: true,
            currentVersion: 'v1',
          }),
          // Fallback to the V1 signin!
          mockGqlBeginSigninMutation({ keys: false }, {}, { verified: false }),
        ]);

        await waitFor(async () => {
          const handlerResult = await currentSigninProps?.beginSigninHandler(
            MOCK_EMAIL,
            MOCK_PASSWORD
          );
          expect(handlerResult?.error).toBeUndefined();
          expect(mockSentryCaptureMessage).toBeCalledTimes(0);
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
      mockUseValidateModule();
      render([mockGqlAvatarUseQuery()]);

      await waitFor(() => {
        expect(currentSigninProps?.email).toBe(MOCK_QUERY_PARAM_EMAIL);
      });

      await waitFor(async () => {
        const handlerResult = await currentSigninProps?.cachedSigninHandler(
          MOCK_SESSION_TOKEN
        );

        expect(mockAuthClient.accountProfile).toBeCalledWith(
          MOCK_SESSION_TOKEN
        );
        expect(mockAuthClient.recoveryEmailStatus).toBeCalledWith(
          MOCK_SESSION_TOKEN
        );
        expect(handlerResult?.data?.verificationMethod).toEqual(
          VerificationMethods.EMAIL_OTP
        );
        expect(handlerResult?.data?.verificationReason).toEqual(
          VerificationReasons.SIGN_IN
        );
        expect(handlerResult?.data?.verified).toEqual(true);
        expect(handlerResult?.data?.sessionVerified).toEqual(true);
        expect(handlerResult?.data?.emailVerified).toEqual(true);
      });
    });

    it('returns TOTP_2FA verification method and SIGN_UP verification reason when expected', async () => {
      mockAuthClient.accountProfile = jest.fn().mockResolvedValue({
        authenticationMethods: ['pwd', 'email', 'otp'],
      });
      mockAuthClient.recoveryEmailStatus = jest.fn().mockResolvedValue({
        verified: true,
        sessionVerified: true,
        emailVerified: false,
      });

      mockUseValidateModule();
      render([mockGqlAvatarUseQuery()]);

      await waitFor(async () => {
        const handlerResult = await currentSigninProps?.cachedSigninHandler(
          MOCK_SESSION_TOKEN
        );

        expect(handlerResult?.data?.verificationMethod).toEqual(
          VerificationMethods.TOTP_2FA
        );
        expect(handlerResult?.data?.verificationReason).toEqual(
          VerificationReasons.SIGN_UP
        );
        expect(handlerResult?.data?.emailVerified).toEqual(false);
      });
    });

    it('handles invalid token error', async () => {
      mockAuthClient.accountProfile = jest
        .fn()
        .mockRejectedValue(AuthUiErrors.INVALID_TOKEN);

      mockUseValidateModule();
      render([mockGqlAvatarUseQuery()]);

      await waitFor(async () => {
        const handlerResult = await currentSigninProps?.cachedSigninHandler(
          MOCK_SESSION_TOKEN
        );
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
      mockAuthClient.recoveryEmailStatus = jest
        .fn()
        .mockRejectedValue(AuthUiErrors.UNEXPECTED_ERROR);
      mockUseValidateModule();
      render([mockGqlAvatarUseQuery()]);

      await waitFor(async () => {
        const handlerResult = await currentSigninProps?.cachedSigninHandler(
          MOCK_SESSION_TOKEN
        );

        expect(CacheModule.discardSessionToken).not.toHaveBeenCalled();
        expect(handlerResult?.data).toBeUndefined();
        expect(handlerResult?.error).toEqual(AuthUiErrors.UNEXPECTED_ERROR);
      });
    });
  });
});
