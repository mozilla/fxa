/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as UseValidateModule from '../../lib/hooks/useValidate';
import * as ApolloModule from '@apollo/client';
import * as SigninModule from './index';
import * as ModelsModule from '../../models';
import * as ReactUtils from 'fxa-react/lib/utils';
import * as CacheModule from '../../lib/cache';
import * as CryptoModule from 'fxa-auth-client/lib/crypto';

import { LocationProvider } from '@reach/router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import SigninContainer from './container';
import { SigninContainerIntegration, SigninProps } from './interfaces';
import { MozServices } from '../../lib/types';
import { screen, waitFor } from '@testing-library/react';
import { ModelDataProvider } from '../../lib/model-data';
import {
  MOCK_STORED_ACCOUNT,
  MOCK_AVATAR_DEFAULT,
  MOCK_EMAIL,
  MOCK_PASSWORD,
  MOCK_AUTH_PW,
  MOCK_UID,
  MOCK_SESSION_TOKEN,
  MOCK_AUTH_AT,
  MOCK_UNWRAP_BKEY,
} from '../mocks';
import { IntegrationType } from '../../models';
import { ApolloClient } from '@apollo/client';
import { MOCK_VERIFICATION, createBeginSigninResponse } from './mocks';
import firefox from '../../lib/channels/firefox';
import AuthClient from 'fxa-auth-client/browser';
import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { GraphQLError } from 'graphql';

let integration: SigninContainerIntegration;

// TODO with Sync ticket
// function mockSyncDesktopV3Integration() {
//   integration = {
//     type: IntegrationType.SyncDesktopV3,
//     getService: () => MozServices.FirefoxSync,
//     isSync: () => true,
//   };
// }
function mockWebIntegration() {
  integration = {
    type: IntegrationType.Web,
    getService: () => MozServices.Default,
    isSync: () => false,
  };
}

function applyDefaultMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();

  mockReactUtilsModule();
  mockWebIntegration();
  mockApolloClientModule();
  mockLocationState = {};

  mockSigninModule();
  mockModelsModule();
  mockUseValidateModule({ queryParams: MOCK_QUERY_PARAM_MODEL_NO_VALUES });
  mockCurrentAccount();
  mockCryptoModule();
}

jest.mock('../../models', () => {
  return {
    ...jest.requireActual('../../models'),
    useAuthClient: jest.fn(),
  };
});
const mockAuthClient = new AuthClient('http://localhost:9000', {
  keyStretchVersion: 1,
});
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
  (ModelsModule.useAuthClient as jest.Mock).mockImplementation(
    () => mockAuthClient
  );
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

let mockBeginSigninMutation = jest.fn();
let mockAvatarQuery = jest.fn();
function mockApolloClientModule() {
  mockBeginSigninMutation.mockImplementation(async () =>
    createBeginSigninResponse()
  );

  jest.spyOn(ApolloModule, 'useMutation').mockReturnValue([
    async (...args: any[]) => {
      return mockBeginSigninMutation(...args);
    },
    {
      loading: false,
      called: true,
      client: {} as ApolloClient<any>,
      reset: () => {},
    },
  ]);
  mockAvatarUseQuery();
}

function mockAvatarUseQuery() {
  mockAvatarQuery.mockImplementation(() => {
    return {
      data: MOCK_AVATAR_DEFAULT,
    };
  });

  jest.spyOn(ApolloModule, 'useQuery').mockReturnValue(mockAvatarQuery());
}

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
  jest
    .spyOn(ReactUtils, 'hardNavigateToContentServer')
    .mockImplementation(() => {});
}

function mockCryptoModule() {
  jest.spyOn(CryptoModule, 'getCredentials').mockResolvedValue({
    authPW: MOCK_AUTH_PW,
    unwrapBKey: MOCK_UNWRAP_BKEY, // needed for type
  });
}

function render() {
  renderWithLocalizationProvider(
    <LocationProvider>
      <SigninContainer
        {...{
          integration,
          serviceName: MozServices.Default,
        }}
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
        expect(CacheModule.currentAccount).not.toBeCalled();
        await waitFor(() => {
          expect(currentSigninProps?.email).toBe(MOCK_QUERY_PARAM_EMAIL);
        });
        expect(SigninModule.default).toBeCalled();
      });
      it('query param state takes precedence over router state', async () => {
        mockUseValidateModule();
        mockLocationState = MOCK_LOCATION_STATE_COMPLETE;
        render();
        expect(CacheModule.currentAccount).not.toBeCalled();
        await waitFor(() => {
          expect(currentSigninProps?.email).toBe(MOCK_QUERY_PARAM_EMAIL);
        });
        expect(SigninModule.default).toBeCalled();
      });
      it('can be set from router state', async () => {
        mockLocationState = MOCK_LOCATION_STATE_COMPLETE;
        render();
        await waitFor(() => {
          expect(CacheModule.currentAccount).not.toBeCalled();
        });
        expect(currentSigninProps?.email).toBe(MOCK_ROUTER_STATE_EMAIL);
        expect(SigninModule.default).toBeCalled();
      });
      it('is read from localStorage if email is not provided via query param or router state', async () => {
        mockCurrentAccount(MOCK_STORED_ACCOUNT);
        render();
        expect(CacheModule.currentAccount).toBeCalled();
        await waitFor(() => {
          expect(currentSigninProps?.email).toBe(MOCK_STORED_ACCOUNT.email);
        });
        expect(SigninModule.default).toBeCalled();
      });
      it('is handled if not provided in query params, location state, or local storage', async () => {
        render();
        expect(CacheModule.currentAccount).toBeCalled();
        expect(ReactUtils.hardNavigateToContentServer).toBeCalledWith('/');
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
        render();
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
        render();
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
      render();
      await waitFor(() => {
        expect(mockAuthClient.accountStatusByEmail).toBeCalledWith(
          MOCK_QUERY_PARAM_EMAIL,
          { thirdPartyAuthStatus: true }
        );
      });
    });
    it('accountStatusByEmail is called, email provided by local storage', async () => {
      mockCurrentAccount(MOCK_STORED_ACCOUNT);
      render();
      await waitFor(() => {
        expect(mockAuthClient.accountStatusByEmail).toBeCalledWith(
          MOCK_STORED_ACCOUNT.email,
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

      render();
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          `/signup?email=${MOCK_QUERY_PARAM_EMAIL}&emailStatusChecked=true`
        );
      });
    });
    describe('web channel messages', () => {
      let fxaLoginSpy: jest.SpyInstance;
      beforeEach(() => {
        fxaLoginSpy = jest.spyOn(firefox, 'fxaCanLinkAccount');
      });

      // TODO in Sync ticket. Is this being sent under the right conditions?
      // it('are sent for sync', async () => {
      //   mockSyncDesktopV3Integration();
      //   render();
      //   await waitFor(() => {
      //     expect(fxaLoginSpy).toBeCalledWith({ email: MOCK_QUERY_PARAM_EMAIL });
      //   });
      // });
      it('are not sent for non-sync', () => {
        render();
        expect(fxaLoginSpy).not.toBeCalled();
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

      expect(currentSigninProps).toBeDefined();
      const handlerResult = await currentSigninProps?.beginSigninHandler(
        MOCK_EMAIL,
        MOCK_PASSWORD
      );
      expect(mockBeginSigninMutation).toBeCalledWith({
        variables: {
          input: {
            email: MOCK_EMAIL,
            authPW: MOCK_AUTH_PW,
            options: {
              verificationMethod: VerificationMethods.EMAIL_OTP,
            },
          },
        },
      });
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
    it('handles error', async () => {
      mockBeginSigninMutation.mockImplementation(async () => {
        const gqlError = new GraphQLError(
          AuthUiErrors.INCORRECT_PASSWORD.message
        );
        const error: GraphQLError = Object.assign(gqlError, {
          extensions: {
            ...(gqlError.extensions || {}),
            ...MOCK_VERIFICATION,
            errno: AuthUiErrors.INCORRECT_PASSWORD.errno,
          },
        });
        throw new ApolloModule.ApolloError({
          graphQLErrors: [error],
        });
      });

      render();

      await waitFor(async () => {
        const result = await currentSigninProps?.beginSigninHandler(
          MOCK_EMAIL,
          MOCK_PASSWORD
        );
        expect(result?.data).toBeNull();
        expect(result?.error?.message).toEqual(
          AuthUiErrors.INCORRECT_PASSWORD.message
        );
      });
    });

    describe('cachedSigninHandler', () => {
      beforeEach(() => {
        mockCurrentAccount(MOCK_STORED_ACCOUNT);
      });
      it('runs handler, calls accountProfile and recoveryEmailStatus', async () => {
        render();

        await waitFor(async () => {
          expect(currentSigninProps).toBeDefined();
        });
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
      it('returns TOTP_2FA verification method and SIGN_UP verification reason when expected', async () => {
        mockAuthClient.accountProfile = jest.fn().mockResolvedValue({
          authenticationMethods: ['pwd', 'email', 'otp'],
        });
        mockAuthClient.recoveryEmailStatus = jest.fn().mockResolvedValue({
          verified: true,
          sessionVerified: true,
          emailVerified: false,
        });

        render();
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
        mockAuthClient.accountProfile = jest.fn().mockRejectedValue({
          errno: AuthUiErrors.INVALID_TOKEN.errno,
        });
        render();

        await waitFor(async () => {
          const handlerResult = await currentSigninProps?.cachedSigninHandler(
            MOCK_SESSION_TOKEN
          );
          expect(CacheModule.discardSessionToken).toHaveBeenCalled();
          expect(handlerResult?.data).toBeNull();
          expect(handlerResult?.error?.errno).toEqual(
            AuthUiErrors.SESSION_EXPIRED.errno
          );
          expect(handlerResult?.error?.message).toEqual(
            AuthUiErrors.SESSION_EXPIRED.message
          );
        });
      });
      it('handles other errors', async () => {
        mockAuthClient.recoveryEmailStatus = jest.fn().mockRejectedValue({
          errno: AuthUiErrors.UNEXPECTED_ERROR.errno,
        });
        render();

        await waitFor(async () => {
          const handlerResult = await currentSigninProps?.cachedSigninHandler(
            MOCK_SESSION_TOKEN
          );
          expect(CacheModule.discardSessionToken).not.toHaveBeenCalled();
          expect(handlerResult?.data).toBeNull();
          expect(handlerResult?.error?.message).toEqual(
            AuthUiErrors.UNEXPECTED_ERROR.message
          );
        });
      });
    });
  });
});
