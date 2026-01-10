/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Mocked Module Imports
import * as ModelsModule from '../../../models';
import * as SigninUnblockModule from './index';
import * as ReachRouterModule from '@reach/router';

// Regular imports
import { act, screen } from '@testing-library/react';
import { LocationProvider } from '@reach/router';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import SigninUnblockContainer from './container';
import { MozServices } from '../../../lib/types';

import {
  MOCK_AUTH_PW,
  MOCK_AUTH_PW_V2,
  MOCK_CLIENT_SALT,
  MOCK_EMAIL,
  MOCK_PASSWORD,
  MOCK_UNBLOCK_CODE,
  MOCK_UNWRAP_BKEY,
  MOCK_UNWRAP_BKEY_V2,
  mockLoadingSpinnerModule,
} from '../../mocks';

import { mockSensitiveDataClient as createMockSensitiveDataClient } from '../../../models/mocks';

import { SigninUnblockLocationState, SigninUnblockProps } from './interfaces';

import { QueryParams } from '../../..';

import {
  createMockSigninWebSyncIntegration,
  MOCK_SIGNIN_UNBLOCK_LOCATION_STATE,
} from './mocks';
import { BeginSigninResult, SigninUnblockIntegration } from '../interfaces';
import { tryFinalizeUpgrade } from '../../../lib/auth-key-stretch-upgrade';

let integration: SigninUnblockIntegration;
function mockWebIntegration() {
  integration = {
    ...createMockSigninWebSyncIntegration(),
    clientInfo: undefined,
    isFirefoxMobileClient: () => false,
  };
}

let flowQueryParams: QueryParams;
function mockQueryFlowParameters() {
  flowQueryParams = {
    service: 'sync',
    flowId: '00ff',
  };
}

let currentPageProps: SigninUnblockProps | undefined;
function mockSigninUnblockModule() {
  currentPageProps = undefined;
  jest.spyOn(SigninUnblockModule, 'default').mockImplementation((props) => {
    currentPageProps = props;
    return <div>signin unblock mock</div>;
  });
}

jest.mock('../../../lib/auth-key-stretch-upgrade', () => {
  return {
    tryFinalizeUpgrade: jest.fn(),
  };
});

jest.mock('../../../models', () => {
  return {
    ...jest.requireActual('../../../models'),
    useAuthClient: jest.fn(),
    useSensitiveDataClient: jest.fn(),
  };
});

jest.mock('fxa-auth-client/lib/crypto', () => {
  return {
    getCredentials: () => ({
      authPW: MOCK_AUTH_PW,
      unwrapBKey: MOCK_UNWRAP_BKEY,
    }),
    getCredentialsV2: () => ({
      authPW: MOCK_AUTH_PW_V2,
      unwrapBKey: MOCK_UNWRAP_BKEY_V2,
    }),
  };
});

let mockNavigate = jest.fn();
function mockReachRouter(mockLocationState?: SigninUnblockLocationState) {
  mockNavigate.mockReset();
  jest.spyOn(ReachRouterModule, 'useLocation').mockImplementation(() => {
    return {
      ...global.window.location,
      pathname: '/signin_unblock',
      state: mockLocationState,
    };
  });
}

const mockSensitiveDataClient = createMockSensitiveDataClient();

// Mock auth client
const mockAuthClient = {
  getCredentialStatusV2: jest.fn(),
  signInWithAuthPW: jest.fn(),
  sendUnblockCode: jest.fn(),
};

function mockModelsModule() {
  (ModelsModule.useSensitiveDataClient as jest.Mock).mockImplementation(
    () => mockSensitiveDataClient
  );
  (ModelsModule.useAuthClient as jest.Mock).mockImplementation(
    () => mockAuthClient
  );
  mockSensitiveDataClient.KeyStretchUpgradeData = undefined;
  mockSensitiveDataClient.getDataType = jest.fn().mockReturnValue({
    plainTextPassword: MOCK_PASSWORD,
  });

  // Default auth client mock responses
  mockAuthClient.getCredentialStatusV2.mockResolvedValue({
    upgradeNeeded: true,
    currentVersion: 'v2',
    clientSalt: MOCK_CLIENT_SALT,
  });
  mockAuthClient.signInWithAuthPW.mockResolvedValue({
    uid: 'abc123',
    sessionToken: 'token123',
    authAt: Date.now(),
    metricsEnabled: true,
    emailVerified: true,
    sessionVerified: false,
    verificationMethod: 'email-otp',
    verificationReason: 'login',
    keyFetchToken: 'kft123',
  });
  mockAuthClient.sendUnblockCode.mockResolvedValue({});
}

function applyDefaultMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();
  mockSigninUnblockModule();
  mockLoadingSpinnerModule();
  mockModelsModule();
  mockReachRouter(MOCK_SIGNIN_UNBLOCK_LOCATION_STATE);
  mockWebIntegration();
  mockQueryFlowParameters();
}

describe('signin unblock container', () => {
  beforeEach(() => {
    applyDefaultMocks();
  });

  /** Renders the container with a fake page component */
  async function render() {
    renderWithLocalizationProvider(
      <LocationProvider>
        <SigninUnblockContainer
          {...{
            integration,
            serviceName: MozServices.Default,
            flowQueryParams,
          }}
        />
      </LocationProvider>
    );

    await screen.findByText('signin unblock mock');
    expect(SigninUnblockModule.default).toHaveBeenCalled();
  }

  it('handles signin with correct code', async () => {
    await render();

    let result: BeginSigninResult | undefined;
    await act(async () => {
      result = await currentPageProps?.signinWithUnblockCode(MOCK_UNBLOCK_CODE);
    });

    expect(result).toBeDefined();
    expect(result?.data).toBeDefined();
    expect(result?.data?.unwrapBKey).toEqual(MOCK_UNWRAP_BKEY_V2);
    expect(result?.data?.signIn?.uid).toBeDefined();
    expect(result?.data?.signIn?.sessionToken).toBeDefined();
    expect(result?.data?.signIn?.emailVerified).toBeDefined();
    expect(result?.data?.signIn?.sessionVerified).toBeDefined();
    expect(result?.data?.signIn?.metricsEnabled).toBeDefined();
  });

  it('handles signin with with key stretching upgrade', async () => {
    mockSensitiveDataClient.KeyStretchUpgradeData = {
      email: MOCK_EMAIL,
      v1Credentials: {
        authPW: MOCK_AUTH_PW,
        unwrapBKey: MOCK_UNWRAP_BKEY,
      },
      v2Credentials: {
        authPW: MOCK_AUTH_PW_V2,
        unwrapBKey: MOCK_UNWRAP_BKEY_V2,
        clientSalt: MOCK_CLIENT_SALT,
      },
    };

    // Override to have sessionVerified: true so tryFinalizeUpgrade is called
    mockAuthClient.signInWithAuthPW.mockResolvedValue({
      uid: 'abc123',
      sessionToken: 'token123',
      authAt: Date.now(),
      metricsEnabled: true,
      emailVerified: true,
      sessionVerified: true,
      verificationMethod: 'email-otp',
      verificationReason: 'login',
      keyFetchToken: 'kft123',
    });

    await render();

    let result: BeginSigninResult | undefined;
    await act(async () => {
      result = await currentPageProps?.signinWithUnblockCode(MOCK_UNBLOCK_CODE);
    });

    expect(result).toBeDefined();
    expect(result?.data).toBeDefined();
    expect(result?.data?.unwrapBKey).toEqual(MOCK_UNWRAP_BKEY_V2);
    expect(result?.data?.signIn?.uid).toBeDefined();
    expect(result?.data?.signIn?.sessionToken).toBeDefined();
    expect(result?.data?.signIn?.emailVerified).toBeDefined();
    expect(result?.data?.signIn?.sessionVerified).toBeDefined();
    expect(result?.data?.signIn?.metricsEnabled).toBeDefined();

    expect(tryFinalizeUpgrade).toHaveBeenCalledTimes(1);
  });

  it('handles signin with correct code and failure when looking up credential status', async () => {
    jest.spyOn(global.console, 'warn');
    // Mock credential status to fail
    mockAuthClient.getCredentialStatusV2.mockRejectedValue(new Error('Failed'));

    await render();

    let result: BeginSigninResult | undefined;
    await act(async () => {
      result = await currentPageProps?.signinWithUnblockCode(MOCK_UNBLOCK_CODE);
    });

    expect(result).toBeDefined();
    expect(result?.data).toBeDefined();
    expect(result?.data?.unwrapBKey).toEqual(MOCK_UNWRAP_BKEY);
    expect(result?.data?.signIn?.uid).toBeDefined();
    expect(result?.data?.signIn?.sessionToken).toBeDefined();
    expect(result?.data?.signIn?.emailVerified).toBeDefined();
    expect(result?.data?.signIn?.sessionVerified).toBeDefined();
    expect(result?.data?.signIn?.metricsEnabled).toBeDefined();
    // console warning during test execution is also expected here
    expect(console.warn).toHaveBeenCalledWith(
      'Could not get credential status!'
    );
  });

  it('handles incorrect unblock code', async () => {
    const wrongCode = '000000';
    // Mock signin to fail with incorrect unblock code error
    mockAuthClient.signInWithAuthPW.mockRejectedValue({
      errno: AuthUiErrors.INCORRECT_UNBLOCK_CODE.errno,
      message: AuthUiErrors.INCORRECT_UNBLOCK_CODE.message,
    });

    await render();

    let result: BeginSigninResult | undefined;
    await act(async () => {
      result = await currentPageProps?.signinWithUnblockCode(wrongCode);
    });

    expect(result).toBeDefined();
    expect(result?.data).toBeUndefined();
    expect(result?.error).toBeDefined();
    expect(result?.error?.errno).toEqual(127);
  });
});
