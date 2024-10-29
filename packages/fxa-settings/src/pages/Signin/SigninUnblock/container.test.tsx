/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Mocked Module Imports
import * as SigninUnblockModule from './index';
import * as ReachRouterModule from '@reach/router';
import * as ModelsModule from '../../../models';

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
  MOCK_PASSWORD,
  MOCK_UNBLOCK_CODE,
  MOCK_UNWRAP_BKEY,
  MOCK_UNWRAP_BKEY_V2,
  mockLoadingSpinnerModule,
} from '../../mocks';
import {
  mockGqlBeginSigninMutation,
  mockGqlCredentialStatusMutation,
  mockGqlError,
} from '../mocks';

import { mockSensitiveDataClient as createMockSensitiveDataClient } from '../../../models/mocks';

import { SigninUnblockLocationState, SigninUnblockProps } from './interfaces';

import { QueryParams } from '../../..';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';

import {
  createMockSigninWebSyncIntegration,
  MOCK_SIGNIN_UNBLOCK_LOCATION_STATE,
} from './mocks';
import { BeginSigninResult, SigninUnblockIntegration } from '../interfaces';

let integration: SigninUnblockIntegration;
function mockWebIntegration() {
  integration = {
    ...createMockSigninWebSyncIntegration(),
    clientInfo: undefined,
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
const mockSensitiveDataClientState: Record<string, any> = {};
mockSensitiveDataClient.setData = function (key, value) {
  mockSensitiveDataClientState[key] = value;
};
mockSensitiveDataClient.getData = function (key: string) {
  return mockSensitiveDataClientState[key];
};
function mockModelsModule() {
  mockSensitiveDataClientState['auth'] = { password: MOCK_PASSWORD };
  (ModelsModule.useSensitiveDataClient as jest.Mock).mockReturnValue(
    mockSensitiveDataClient
  );
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
  async function render(mocks: Array<MockedResponse>) {
    renderWithLocalizationProvider(
      <MockedProvider mocks={mocks} addTypename={false}>
        <LocationProvider>
          <SigninUnblockContainer
            {...{
              integration,
              serviceName: MozServices.Default,
              flowQueryParams,
            }}
          />
        </LocationProvider>
      </MockedProvider>
    );

    await screen.findByText('signin unblock mock');
    expect(SigninUnblockModule.default).toBeCalled();
  }

  it('handles signin with correct code', async () => {
    await render([
      mockGqlCredentialStatusMutation(),
      mockGqlBeginSigninMutation(
        {
          unblockCode: MOCK_UNBLOCK_CODE,
          keys: true,
        },
        {
          authPW: MOCK_AUTH_PW_V2,
        }
      ),
    ]);

    let result: BeginSigninResult | undefined;
    await act(async () => {
      result = await currentPageProps?.signinWithUnblockCode(MOCK_UNBLOCK_CODE);
    });

    expect(result).toBeDefined();
    expect(result?.data).toBeDefined();
    expect(result?.data?.unwrapBKey).toEqual(MOCK_UNWRAP_BKEY_V2);
    expect(result?.data?.signIn?.uid).toBeDefined();
    expect(result?.data?.signIn?.sessionToken).toBeDefined();
    expect(result?.data?.signIn?.verified).toBeDefined();
    expect(result?.data?.signIn?.metricsEnabled).toBeDefined();
  });

  it('handles signin with correct code and failure when looking up credential status', async () => {
    await render([
      {
        ...mockGqlCredentialStatusMutation(),
        error: mockGqlError(),
      },
      mockGqlBeginSigninMutation({
        unblockCode: MOCK_UNBLOCK_CODE,
        keys: true,
      }),
    ]);

    let result: BeginSigninResult | undefined;
    await act(async () => {
      result = await currentPageProps?.signinWithUnblockCode(MOCK_UNBLOCK_CODE);
    });

    expect(result).toBeDefined();
    expect(result?.data).toBeDefined();
    expect(result?.data?.unwrapBKey).toEqual(MOCK_UNWRAP_BKEY);
    expect(result?.data?.signIn?.uid).toBeDefined();
    expect(result?.data?.signIn?.sessionToken).toBeDefined();
    expect(result?.data?.signIn?.verified).toBeDefined();
    expect(result?.data?.signIn?.metricsEnabled).toBeDefined();
  });

  it('handles incorrect unblock code', async () => {
    const wrongCode = '000000';
    await render([
      mockGqlCredentialStatusMutation(),
      {
        ...(() => {
          const result = mockGqlBeginSigninMutation(
            {
              unblockCode: wrongCode,
              keys: true,
            },
            {
              authPW: MOCK_AUTH_PW_V2,
            }
          );
          return result;
        })(),
        error: mockGqlError(AuthUiErrors.INCORRECT_UNBLOCK_CODE),
      },
    ]);

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
