/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as ApolloClientModule from '@apollo/client';
import * as InlineTotpSetupModule from './index';
import * as utils from 'fxa-react/lib/utils';

import { ApolloClient } from '@apollo/client';
import { LocationProvider } from '@reach/router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { MozServices } from '../../lib/types';
import { OAuthIntegration } from '../../models';
import InlineTotpSetupContainer from './container';
import {
  MOCK_TOTP_TOKEN,
  MOCK_QUERY_PARAMS,
  MOCK_SIGNIN_LOCATION_STATE,
  MOCK_EMAIL,
  MOCK_SIGNIN_RECOVERY_LOCATION_STATE,
} from './mocks';
import { screen, waitFor } from '@testing-library/react';
import { AuthUiError, AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import {
  MOCK_FLOW_ID,
  MOCK_NO_TOTP,
  MOCK_TOTP_STATUS_VERIFIED,
} from '../Signin/mocks';
import { SigninLocationState } from '../Signin/interfaces';

const mockLocationHook = (
  queryParams: Record<string, string> = MOCK_QUERY_PARAMS,
  state: SigninLocationState | null = MOCK_SIGNIN_LOCATION_STATE
) => {
  return {
    pathname: '/inline_totp_setup',
    search: '?' + new URLSearchParams(queryParams),
    state,
  };
};
const mockNavigateHook = jest.fn();
jest.mock('@reach/router', () => {
  return {
    ...jest.requireActual('@reach/router'),
    useNavigate: () => mockNavigateHook,
    useLocation: () => mockLocationHook(),
  };
});

let mockSessionHook: () => any = () => null;
jest.mock('../../models', () => {
  return {
    ...jest.requireActual('../../models'),
    useSession: jest.fn(() => mockSessionHook()),
  };
});

let mockCheckCode: () => boolean = () => true;
jest.mock('../../lib/totp', () => {
  return {
    ...jest.requireActual('../../lib/totp'),
    checkCode: jest.fn(() => mockCheckCode()),
  };
});

let mockTotpStatusQuery = jest.fn();
function setMocks() {
  mockCheckCode = () => true;
  let mockCreateTotpMutation = jest
    .fn()
    .mockResolvedValue({ data: { createTotp: MOCK_TOTP_TOKEN } });
  jest.spyOn(ApolloClientModule, 'useMutation').mockReturnValue([
    async (...args: any[]) => {
      return mockCreateTotpMutation(...args);
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
  jest.spyOn(InlineTotpSetupModule, 'default');
  (InlineTotpSetupModule.default as jest.Mock).mockReset();
  mockNavigateHook.mockReset();
}

const defaultProps = {
  isSignedIn: true,
  integration: {
    returnOnError: () => true,
    getRedirectWithErrorUrl: (error: AuthUiError) =>
      `https://localhost:8080/?error=${error.errno}`,
  } as unknown as OAuthIntegration,
  serviceName: MozServices.Default,
};
function render(props = {}) {
  renderWithLocalizationProvider(
    <LocationProvider>
      <InlineTotpSetupContainer
        {...{
          ...defaultProps,
          ...props,
          flowQueryParams: { flowId: MOCK_FLOW_ID },
        }}
      />
    </LocationProvider>
  );
}

describe('InlineTotpSetupContainer', () => {
  beforeEach(() => {
    setMocks();
  });

  describe('redirects away', () => {
    it('redirects when user is not signed in', () => {
      render({ isSignedIn: false });
      const location = mockLocationHook();
      expect(mockNavigateHook).toHaveBeenCalledWith(
        `/signup${location.search}`,
        { state: undefined }
      );
    });

    it('redirects when there is no signin state', () => {
      render();
      const location = mockLocationHook(MOCK_QUERY_PARAMS, null);
      expect(mockNavigateHook).toHaveBeenCalledWith(
        `/signup${location.search}`,
        { state: undefined }
      );
    });

    it('redirects when the session is not verified', async () => {
      mockSessionHook = () => ({ isSessionVerified: async () => false });
      render();
      const location = mockLocationHook();
      await waitFor(() => {
        expect(mockNavigateHook).toHaveBeenCalledWith(
          `/signin_token_code${location.search}`,
          { state: MOCK_SIGNIN_LOCATION_STATE }
        );
      });
    });

    it('redirects when totp is active on the account', async () => {
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
      render();
      const location = mockLocationHook();
      await waitFor(() => {
        expect(mockNavigateHook).toHaveBeenCalledWith(
          `/signin_totp_code${location.search}`,
          { state: MOCK_SIGNIN_LOCATION_STATE }
        );
      });
    });
  });

  describe('renders', () => {
    beforeEach(() => {
      mockSessionHook = () => ({ isSessionVerified: async () => true });
    });

    it('displays loading spinner when loading', async () => {
      mockTotpStatusQuery.mockImplementation(() => {
        return {
          data: null,
          loading: true,
        };
      });
      jest
        .spyOn(ApolloClientModule, 'useQuery')
        .mockReturnValue(mockTotpStatusQuery());

      render();
      await waitFor(() => {
        expect(mockTotpStatusQuery).toBeCalled();
      });
      screen.getByLabelText('Loading…');
      expect(InlineTotpSetupModule.default).not.toBeCalled();
    });

    it('invokes InlineTotpSetup with the correct props', async () => {
      render();
      await waitFor(() => {
        expect(InlineTotpSetupModule.default).toHaveBeenCalled();
        const args = (InlineTotpSetupModule.default as jest.Mock).mock
          .calls[0][0];
        expect(args.totp).toBe(MOCK_TOTP_TOKEN);
        expect(args.email).toBe(MOCK_EMAIL);
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
            expect(InlineTotpSetupModule.default).toHaveBeenCalled();
          });
          const args = (InlineTotpSetupModule.default as jest.Mock).mock
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
            expect(InlineTotpSetupModule.default).toHaveBeenCalled();
          });
          const args = (InlineTotpSetupModule.default as jest.Mock).mock
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

      describe('verifyCodeHandler', () => {
        it('throws an error when the code is invalid', async () => {
          mockCheckCode = () => false;
          render();
          await waitFor(() => {
            expect(InlineTotpSetupModule.default).toHaveBeenCalled();
          });
          const args = (InlineTotpSetupModule.default as jest.Mock).mock
            .calls[0][0];
          const verifyCodeHandler = args.verifyCodeHandler;

          // jest didn't like some syntax in AuthUiErrors when I tried to use
          // expect().toThrow()
          try {
            await verifyCodeHandler('0101');
            expect(true).toBe(false); // an error should've been thrown
          } catch (err) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(err).toBe(AuthUiErrors.INVALID_TOTP_CODE);
          }
        });

        it('throws an error when checking the code errors', async () => {
          mockCheckCode = () => {
            throw new Error();
          };
          render();
          await waitFor(() => {
            expect(InlineTotpSetupModule.default).toHaveBeenCalled();
          });
          const args = (InlineTotpSetupModule.default as jest.Mock).mock
            .calls[0][0];
          const verifyCodeHandler = args.verifyCodeHandler;

          // jest didn't like some syntax in AuthUiErrors when I tried to use
          // expect().toThrow()
          try {
            await verifyCodeHandler('1010');
            expect(true).toBe(false); // an error should've been thrown
          } catch (err) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(err).toBe(AuthUiErrors.INVALID_TOTP_CODE);
          }
        });

        it('redirects to inline_recovery_setup when the code is valid', async () => {
          render();
          await waitFor(() => {
            expect(InlineTotpSetupModule.default).toHaveBeenCalled();
          });
          const args = (InlineTotpSetupModule.default as jest.Mock).mock
            .calls[0][0];
          const verifyCodeHandler = args.verifyCodeHandler;
          await verifyCodeHandler('1010');
          expect(mockNavigateHook).toHaveBeenCalledWith(
            `/inline_recovery_setup?${new URLSearchParams(MOCK_QUERY_PARAMS)}`,
            { state: MOCK_SIGNIN_RECOVERY_LOCATION_STATE }
          );
        });
      });
    });
  });
});
