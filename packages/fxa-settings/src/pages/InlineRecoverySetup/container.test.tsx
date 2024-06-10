/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as ApolloClientModule from '@apollo/client';
import * as InlineRecoverySetupModule from '.';
import * as utils from 'fxa-react/lib/utils';

import { ApolloClient } from '@apollo/client';
import { LocationProvider } from '@reach/router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { AuthUiError, AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { MozServices } from '../../lib/types';
import { OAuthIntegration } from '../../models';
import {
  MOCK_QUERY_PARAMS,
  MOCK_SIGNIN_LOCATION_STATE,
  MOCK_SIGNIN_RECOVERY_LOCATION_STATE,
  MOCK_TOTP_TOKEN,
} from '../InlineTotpSetup/mocks';
import InlineRecoverySetupContainer from './container';
import AuthClient from 'fxa-auth-client/browser';
import { waitFor } from '@testing-library/react';
import {
  MOCK_NO_TOTP,
  MOCK_OAUTH_FLOW_HANDLER_RESPONSE,
  MOCK_TOTP_STATUS_VERIFIED,
} from '../Signin/mocks';
import { useFinishOAuthFlowHandler } from '../../lib/oauth/hooks';

let mockLocationState = {};
const mockSearch = '?' + new URLSearchParams(MOCK_QUERY_PARAMS);
const mockLocationHook = () => {
  return {
    pathname: '/inline_recovery_setup',
    search: mockSearch,
    state: mockLocationState,
  };
};
const mockNavigateHook = jest.fn();
jest.mock('@reach/router', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@reach/router'),
    useNavigate: () => mockNavigateHook,
    useLocation: () => mockLocationHook(),
  };
});

jest.mock('../../lib/oauth/hooks.tsx', () => {
  return {
    __esModule: true,
    useFinishOAuthFlowHandler: jest.fn(),
  };
});

const mockAuthClient = new AuthClient('http://localhost:9000', {
  keyStretchVersion: 1,
});
let mockSessionHook: () => any = () => ({ token: 'ABBA' });
jest.mock('../../models', () => {
  return {
    ...jest.requireActual('../../models'),
    useSession: jest.fn(() => mockSessionHook()),
    useAuthClient: jest.fn(() => mockAuthClient),
  };
});

let mockGetCode = jest.fn().mockReturnValue('123456');
jest.mock('../../lib/totp', () => {
  return {
    ...jest.requireActual('../../lib/totp'),
    getCode: jest.fn((...args) => mockGetCode(...args)),
  };
});

jest.mock('./index', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

let mockVerifyTotpMutation = jest
  .fn()
  .mockResolvedValue({ data: { verifyTotp: { success: true } } });

let mockTotpStatusQuery = jest.fn();
function setMocks() {
  mockLocationState = {};
  mockSessionHook = () => ({ token: 'ABBA' });

  jest.spyOn(ApolloClientModule, 'useMutation').mockReturnValue([
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
  mockTotpStatusQuery.mockImplementation(() => {
    return {
      data: MOCK_NO_TOTP,
      loading: false,
    };
  });
  jest
    .spyOn(ApolloClientModule, 'useQuery')
    .mockReturnValue(mockTotpStatusQuery());
  (InlineRecoverySetupModule.default as jest.Mock).mockReset();
  mockNavigateHook.mockReset();
  (useFinishOAuthFlowHandler as jest.Mock).mockImplementation(() => ({
    finishOAuthFlowHandler: jest
      .fn()
      .mockReturnValueOnce(MOCK_OAUTH_FLOW_HANDLER_RESPONSE),
    oAuthDataError: null,
  }));
}

const defaultProps = {
  isSignedIn: true,
  integration: {
    returnOnError: () => true,
    getService: () => '0123456789abcdef',
    getRedirectWithErrorUrl: (error: AuthUiError) =>
      `https://localhost:8080/?error=${error.errno}`,
  } as unknown as OAuthIntegration,
  serviceName: MozServices.Default,
};
function render(props = {}) {
  renderWithLocalizationProvider(
    <LocationProvider>
      <InlineRecoverySetupContainer {...{ ...defaultProps, ...props }} />
    </LocationProvider>
  );
}

describe('InlineRecoverySetupContainer', () => {
  beforeEach(() => {
    setMocks();
  });

  describe('redirects away', () => {
    it('redirects when user is not signed in', () => {
      mockLocationState = MOCK_SIGNIN_RECOVERY_LOCATION_STATE;
      render({ isSignedIn: false });
      expect(mockNavigateHook).toHaveBeenCalledWith(`/signup${mockSearch}`);
    });

    it('redirects when there is no signin state', () => {
      render();
      expect(mockNavigateHook).toHaveBeenCalledWith(`/signup${mockSearch}`);
    });

    it('redirects when there is no totp token', () => {
      mockLocationState = MOCK_SIGNIN_LOCATION_STATE;
      render();
      expect(mockNavigateHook).toHaveBeenCalledWith(`/signup${mockSearch}`);
    });

    it('redirects when totp is already active', async () => {
      mockSessionHook = () => ({ isSessionVerified: async () => true });
      mockTotpStatusQuery.mockImplementation(() => {
        return {
          data: MOCK_TOTP_STATUS_VERIFIED,
          loading: false,
        };
      });
      jest
        .spyOn(ApolloClientModule, 'useQuery')
        .mockReturnValue(mockTotpStatusQuery());
      mockLocationState = MOCK_SIGNIN_RECOVERY_LOCATION_STATE;

      render();
      expect(mockNavigateHook).toHaveBeenCalledWith(
        `/signin_totp_code${mockSearch}`,
        {
          state: MOCK_SIGNIN_LOCATION_STATE,
        }
      );
    });
  });

  describe('renders', () => {
    beforeEach(() => {
      mockLocationState = MOCK_SIGNIN_RECOVERY_LOCATION_STATE;
    });
    it('invokes InlineRecoverySetup with the correct props', async () => {
      render();
      await waitFor(() => {
        expect(InlineRecoverySetupModule.default).toHaveBeenCalled();
        const args = (InlineRecoverySetupModule.default as jest.Mock).mock
          .calls[0][0];
        expect(args.recoveryCodes).toBe(MOCK_TOTP_TOKEN.recoveryCodes);
        expect(args.serviceName).toBe(MozServices.Default);
      });
    });

    describe('callbacks', () => {
      describe('cancelSetupHandler', () => {
        it('redirects when returnOnError is true', async () => {
          const hardNavigateSpy = jest
            .spyOn(utils, 'hardNavigate')
            .mockImplementation(() => {});
          render();
          await waitFor(() => {
            expect(InlineRecoverySetupModule.default).toHaveBeenCalled();
          });
          const args = (InlineRecoverySetupModule.default as jest.Mock).mock
            .calls[0][0];
          const cancelSetupHandler = args.cancelSetupHandler;
          cancelSetupHandler();
          expect(hardNavigateSpy).toHaveBeenCalledWith(
            'https://localhost:8080/?error=160'
          );
        });

        it('throws an error when returnOnError is false', async () => {
          render({
            integration: {
              ...defaultProps.integration,
              returnOnError: () => false,
            },
          });
          await waitFor(() => {
            expect(InlineRecoverySetupModule.default).toHaveBeenCalled();
          });
          const args = (InlineRecoverySetupModule.default as jest.Mock).mock
            .calls[0][0];
          const cancelSetupHandler = args.cancelSetupHandler;

          // jest didn't like some syntax in AuthUiErrors when I tried to use
          // expect().toThrow()
          try {
            cancelSetupHandler();
            expect(true).toBe(false); // an error should've been thrown
          } catch (err) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(err).toBe(AuthUiErrors.TOTP_REQUIRED);
          }
        });
      });

      describe('verifyTotpHandler', () => {
        it('returns the verifyTotp result', async () => {
          render();
          await waitFor(() => {
            expect(InlineRecoverySetupModule.default).toHaveBeenCalled();
          });
          const args = (InlineRecoverySetupModule.default as jest.Mock).mock
            .calls[0][0];
          const verifyTotpHandler = args.verifyTotpHandler;
          const result = await verifyTotpHandler();
          expect(mockGetCode).toHaveBeenCalledWith(MOCK_TOTP_TOKEN.secret);
          expect(mockVerifyTotpMutation).toHaveBeenCalledTimes(1);
          expect(mockVerifyTotpMutation).toHaveBeenCalledWith({
            variables: {
              input: {
                code: '123456',
                service: '0123456789abcdef',
              },
            },
          });
          expect(result).toBe(true);
        });
      });

      describe('successfulSetupHandler', () => {
        it('calls finishOAuthFlowHandler and navigates to RP', async () => {
          const hardNavigateSpy = jest
            .spyOn(utils, 'hardNavigate')
            .mockImplementation(() => {});

          render();
          await waitFor(() => {
            expect(InlineRecoverySetupModule.default).toHaveBeenCalled();
          });
          const args = (InlineRecoverySetupModule.default as jest.Mock).mock
            .calls[0][0];
          const successfulSetupHandler = args.successfulSetupHandler;
          await successfulSetupHandler();

          expect(hardNavigateSpy).toBeCalledWith(
            MOCK_OAUTH_FLOW_HANDLER_RESPONSE.redirect
          );
        });
      });
    });
  });
});
