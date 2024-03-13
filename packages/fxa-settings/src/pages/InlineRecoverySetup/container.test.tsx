/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as ApolloClientModule from '@apollo/client';
import * as InlineRecoverySetupModule from './index';

import { ApolloClient } from '@apollo/client';
import { LocationProvider } from '@reach/router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { AuthUiError, AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { MozServices } from '../../lib/types';
import { OAuthIntegration } from '../../models';
import { MOCK_TOTP_TOKEN } from '../InlineTotpSetup/mocks';
import InlineRecoverySetupContainer from './container';
import AuthClient from 'fxa-auth-client/browser';
import { waitFor } from '@testing-library/react';

const mockEmail = 'nomannisanislandexcepttheisleofmann@example.gg';
const defaultQueryParams = {
  client_id: 'dcdb5ae7add825d2',
  pkce_client_id: '38a6b9b3a65a1871',
  redirect_uri: 'http%3A%2F%2Flocalhost%3A8080%2Fapi%2Foauth',
  scope: 'profile%20openid',
  acr_values: 'AAL2',
};
let locationState: any = { totp: MOCK_TOTP_TOKEN };
const mockLocationHook = (
  queryParams: Record<string, string> = defaultQueryParams,
  state: unknown = locationState
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

const mockAuthClient = new AuthClient('http://localhost:9000', {
  keyStretchVersion: 1,
});
let mockAccountHook: () => any = () => null;
let mockSessionHook: () => any = () => ({ token: 'ABBA' });
jest.mock('../../models', () => {
  return {
    ...jest.requireActual('../../models'),
    useAccount: jest.fn(() => mockAccountHook()),
    useSession: jest.fn(() => mockSessionHook()),
    useAuthClient: jest.fn(() => mockAuthClient),
  };
});

let mockGetCode = jest.fn();
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

function setMocks() {
  locationState = { totp: MOCK_TOTP_TOKEN };
  mockAccountHook = () => ({
    uid: 'quux',
    email: mockEmail,
    refresh: () => {},
    totpActive: false,
  });
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

  (InlineRecoverySetupModule.default as jest.Mock).mockReset();

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
      render({ isSignedIn: false });
      const location = mockLocationHook();
      expect(mockNavigateHook).toHaveBeenCalledWith(
        `/signup${location.search}`
      );
    });

    it('redirects when there is no account', () => {
      mockAccountHook = () => null;
      render();
      const location = mockLocationHook();
      expect(mockNavigateHook).toHaveBeenCalledWith(
        `/signup${location.search}`
      );
    });

    it('redirects when there is no session', () => {
      mockSessionHook = () => null;
      render();
      const location = mockLocationHook();
      expect(mockNavigateHook).toHaveBeenCalledWith(
        `/signup${location.search}`
      );
    });

    it('redirects when there is no totp token', () => {
      locationState = {};
      render();
      const location = mockLocationHook();
      expect(mockNavigateHook).toHaveBeenCalledWith(
        `/signup${location.search}`
      );
    });

    it('redirects when totp is already active', () => {
      mockAccountHook = () => ({ totpActive: true });
      render();
      const location = mockLocationHook();
      expect(mockNavigateHook).toHaveBeenCalledWith(
        `/signin_totp_code${location.search}`
      );
    });
  });

  describe('renders', () => {
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
          Object.defineProperty(window, 'location', {
            writable: true,
            value: { assign: jest.fn() },
          });
          render();
          await waitFor(() => {
            expect(InlineRecoverySetupModule.default).toHaveBeenCalled();
          });
          const args = (InlineRecoverySetupModule.default as jest.Mock).mock
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
          expect(result).toBe(true);
        });
      });

      // The redirect implementation is to be completed in another issue:
      // FXA-6518.  We'll add the test for that in a follow-up.
      // describe('successfulSetupHandler', () => {});
    });
  });
});
