/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Mocked Module Imports
import * as SigninTotpCodeModule from './index';
import * as UseValidateModule from '../../../lib/hooks/useValidate';
import * as CacheModule from '../../../lib/cache';
import * as ReactUtils from 'fxa-react/lib/utils';
import * as ReachRouterModule from '@reach/router';
import * as ApolloModule from '@apollo/client';

// Regular imports
import { screen } from '@testing-library/react';
import { LocationProvider } from '@reach/router';
import { SigninTotpCodeProps } from './index';
import { ApolloClient } from '@apollo/client';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import SigninTotpCodeContainer from './container';
import { MozServices } from '../../../lib/types';
import { createMockWebIntegration } from '../SigninTokenCode/mocks';
import { Integration, useSensitiveDataClient } from '../../../models';
import { mockSensitiveDataClient as createMockSensitiveDataClient } from '../../../models/mocks';

import {
  MOCK_NON_TOTP_LOCATION_STATE,
  MOCK_TOTP_LOCATION_STATE,
} from './mocks';
import { SigninLocationState } from '../interfaces';
import {
  MOCK_AUTH_PW,
  MOCK_AUTH_PW_V2,
  MOCK_CLIENT_SALT,
  MOCK_EMAIL,
  MOCK_UNWRAP_BKEY,
  MOCK_UNWRAP_BKEY_V2,
  mockLoadingSpinnerModule,
} from '../../mocks';
import { tryFinalizeUpgrade } from '../../../lib/gql-key-stretch-upgrade';

let integration: Integration;

function mockWebIntegration() {
  integration = createMockWebIntegration() as Integration;
}

let currentPageProps: SigninTotpCodeProps | undefined;
function mockSigninTotpModule() {
  currentPageProps = undefined;
  jest
    .spyOn(SigninTotpCodeModule, 'SigninTotpCode')
    .mockImplementation((props) => {
      currentPageProps = props;
      return <div>signin totp code mock</div>;
    });
}

function mockUseValidateModule(opts: any = {}) {
  jest.spyOn(UseValidateModule, 'useValidatedQueryParams').mockReturnValue({
    queryParamModel: {
      verificationReason: 'login',
      service: 'sync',
      ...opts,
    },
    validationError: undefined,
  });
}

jest.mock('../../../models', () => {
  return {
    ...jest.requireActual('../../../models'),
    useAuthClient: jest.fn(),
    useSensitiveDataClient: jest.fn(),
  };
});

jest.mock('../../../lib/gql-key-stretch-upgrade', () => {
  return {
    tryFinalizeUpgrade: jest.fn(),
  };
});

function mockCache(opts: any = {}, isEmpty = false) {
  jest.spyOn(CacheModule, 'currentAccount').mockReturnValue(
    isEmpty
      ? undefined
      : {
          sessionToken: '123',
          ...(opts || {}),
        }
  );
}

function mockReactUtilsModule() {
  jest.spyOn(ReactUtils, 'hardNavigate').mockImplementation(() => {});
}

let mockNavigate = jest.fn();
function mockReachRouter(mockLocationState?: SigninLocationState) {
  mockNavigate.mockReset();
  jest.spyOn(ReachRouterModule, 'useNavigate').mockReturnValue(mockNavigate);
  jest.spyOn(ReachRouterModule, 'useLocation').mockImplementation(() => {
    return {
      ...global.window.location,
      pathname: '/signin_token_code',
      state: mockLocationState,
    };
  });
}

let mockVerifyTotpMutation: jest.Mock;
function mockVerifyTotp(success: boolean = true, errorOut: boolean = false) {
  mockVerifyTotpMutation = jest.fn();
  mockVerifyTotpMutation.mockImplementation(async () => {
    if (errorOut) {
      throw new Error();
    }
    return {
      data: {
        verifyTotp: {
          success,
        },
      },
    };
  });

  jest.spyOn(ApolloModule, 'useMutation').mockReturnValue([
    async (...args: any[]) => {
      return mockVerifyTotpMutation(...args);
    },
    {
      loading: false,
      called: true,
      client: {} as ApolloClient<any>,
      reset: () => {},
    },
  ]);
}
const mockSensitiveDataClient = createMockSensitiveDataClient();
mockSensitiveDataClient.getDataType = jest.fn();
function resetMockSensitiveDataClient() {
  mockSensitiveDataClient.KeyStretchUpgradeData = undefined;
  (useSensitiveDataClient as jest.Mock).mockImplementation(
    () => mockSensitiveDataClient
  );
}

function applyDefaultMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();
  mockSigninTotpModule();
  mockLoadingSpinnerModule();
  mockUseValidateModule();
  mockReactUtilsModule();
  mockCache();
  mockReachRouter(MOCK_TOTP_LOCATION_STATE);
  mockVerifyTotp();
  mockWebIntegration();
  resetMockSensitiveDataClient();
}

describe('signin totp code container', () => {
  beforeEach(() => {
    applyDefaultMocks();
  });

  /** Renders the container with a fake page component */
  async function render(waitForPageToRender = true) {
    renderWithLocalizationProvider(
      <LocationProvider>
        <SigninTotpCodeContainer
          {...{
            integration,
            serviceName: MozServices.Default,
          }}
        />
      </LocationProvider>
    );

    if (waitForPageToRender) {
      await screen.findByText('signin totp code mock');
    }
  }

  it('returns true when code valid', async () => {
    await render();
    expect(SigninTotpCodeModule.SigninTotpCode).toBeCalled();
    const result = await currentPageProps?.submitTotpCode('123456');

    expect(result?.error).toBeUndefined();
  });

  it('runs keys stretch upgrade when required', async () => {
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
    await render();
    expect(SigninTotpCodeModule.SigninTotpCode).toBeCalled();
    const result = await currentPageProps?.submitTotpCode('123456');

    expect(result?.error).toBeUndefined();
    expect(tryFinalizeUpgrade).toBeCalled();
  });

  it('returns false when code not valid', async () => {
    mockVerifyTotp(false);

    await render();
    expect(SigninTotpCodeModule.SigninTotpCode).toBeCalled();

    const result = await currentPageProps?.submitTotpCode('123456');
    expect(result?.error).toEqual(AuthUiErrors.INVALID_TOTP_CODE);
  });

  it('handles general error', async () => {
    mockVerifyTotp(true, true);
    await render();

    expect(SigninTotpCodeModule.SigninTotpCode).toBeCalled();

    const result = await currentPageProps?.submitTotpCode('123456');
    expect(result?.error).toEqual(AuthUiErrors.UNEXPECTED_ERROR);
  });

  it('redirects if page is reached without location state', async () => {
    mockReachRouter();
    mockCache({}, true);
    await render(false);
    expect(mockNavigate).toBeCalledWith('/');
  });

  it('redirects if there is no sessionToken', async () => {
    mockReachRouter();
    mockCache({ sessionToken: '' });
    await render(false);
    expect(mockNavigate).toBeCalledWith('/');
  });

  it('redirects if verification method is not totp', async () => {
    mockReachRouter(MOCK_NON_TOTP_LOCATION_STATE);
    await render(false);
    expect(mockNavigate).toBeCalledWith('/');
  });
});
