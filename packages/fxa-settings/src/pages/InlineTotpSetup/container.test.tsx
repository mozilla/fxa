/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as ApolloClientModule from '@apollo/client';
import * as InlineTotpSetupModule from './index';

import { ApolloClient } from '@apollo/client';
import { LocationProvider } from '@reach/router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { MozServices } from '../../lib/types';
import { OAuthIntegration } from '../../models';
import InlineTotpSetupContainer from './container';
import { MOCK_TOTP_TOKEN } from './mocks';
import { waitFor } from '@testing-library/react';
import { AuthUiError, AuthUiErrors } from '../../lib/auth-errors/auth-errors';

const defaultQueryParams = {
  client_id: 'dcdb5ae7add825d2',
  pkce_client_id: '38a6b9b3a65a1871',
  redirect_uri: 'http%3A%2F%2Flocalhost%3A8080%2Fapi%2Foauth',
  scope: 'profile%20openid',
  acr_values: 'AAL2',
};
const mockLocationHook = (
  queryParams: Record<string, string> = defaultQueryParams,
  state: unknown = undefined
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
    __esModule: true,
    ...jest.requireActual('@reach/router'),
    useNavigate: () => mockNavigateHook,
    useLocation: () => mockLocationHook(),
  };
});

let mockAccountHook: () => any = () => null;
let mockSessionHook: () => any = () => null;
jest.mock('../../models', () => {
  return {
    ...jest.requireActual('../../models'),
    useAccount: jest.fn(() => mockAccountHook()),
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
      <InlineTotpSetupContainer {...{ ...defaultProps, ...props }} />
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

    it('redirects when there is no account', () => {
      render();
      const location = mockLocationHook();
      expect(mockNavigateHook).toHaveBeenCalledWith(
        `/signup${location.search}`,
        { state: undefined }
      );
    });

    it('redirects when there is no session', () => {
      mockAccountHook = () => ({ uid: 'quux' });
      render();
      const location = mockLocationHook();
      expect(mockNavigateHook).toHaveBeenCalledWith(
        `/signup${location.search}`,
        { state: undefined }
      );
    });

    it('redirects when the session is not verified', async () => {
      mockAccountHook = () => ({ uid: 'quux' });
      mockSessionHook = () => ({ isSessionVerified: async () => false });
      render();
      const location = mockLocationHook();
      await waitFor(() => {
        expect(mockNavigateHook).toHaveBeenCalledWith(
          `/signin_token_code${location.search}`,
          { state: undefined }
        );
      });
    });

    it('redirects when totp is active on the account', async () => {
      mockAccountHook = () => ({
        uid: 'quux',
        refresh: () => {},
        totpActive: true,
      });
      mockSessionHook = () => ({ isSessionVerified: async () => true });
      render();
      const location = mockLocationHook();
      await waitFor(() => {
        expect(mockNavigateHook).toHaveBeenCalledWith(
          `/signin_totp_code${location.search}`,
          { state: undefined }
        );
      });
    });
  });

  describe('renders', () => {
    const mockEmail = 'nomannisanislandexcepttheisleofmann@example.gg';

    beforeEach(() => {
      mockAccountHook = () => ({
        uid: 'quux',
        email: mockEmail,
        refresh: () => {},
        totpActive: false,
      });
      mockSessionHook = () => ({ isSessionVerified: async () => true });
    });

    it('invokes InlineTotpSetup with the correct props', async () => {
      render();
      await waitFor(() => {
        expect(InlineTotpSetupModule.default).toHaveBeenCalled();
        const args = (InlineTotpSetupModule.default as jest.Mock).mock
          .calls[0][0];
        expect(args.totp).toBe(MOCK_TOTP_TOKEN);
        expect(args.email).toBe(mockEmail);
        expect(args.serviceName).toBe(MozServices.Default);
      });
    });

    describe('callbacks', () => {
      describe('cancelSetupHandler', () => {
        it('redirects when returnOnError is true', async () => {
          Object.defineProperty(window, 'location', {
            writable: true,
            value: { assign: jest.fn() },
          });
          render();
          await waitFor(() => {
            expect(InlineTotpSetupModule.default).toHaveBeenCalled();
          });
          const args = (InlineTotpSetupModule.default as jest.Mock).mock
            .calls[0][0];
          const cancelSetupHandler = args.cancelSetupHandler;
          cancelSetupHandler();
          expect(window.location.assign).toHaveBeenCalledWith(
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
            `/inline_recovery_setup?${new URLSearchParams(defaultQueryParams)}`,
            { state: { totp: MOCK_TOTP_TOKEN } }
          );
        });
      });
    });
  });
});
