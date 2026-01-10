/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as InlineTotpSetupModule from '.';
import { mockWindowLocation } from 'fxa-react/lib/test-utils/mockWindowLocation';

import { LocationProvider } from '@reach/router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { MozServices } from '../../lib/types';
import { IntegrationType, OAuthIntegration } from '../../models';
import InlineTotpSetupContainer from './container';
import GleanMetrics from '../../lib/glean';
import {
  MOCK_TOTP_TOKEN,
  MOCK_QUERY_PARAMS,
  MOCK_SIGNIN_LOCATION_STATE,
  MOCK_SIGNIN_RECOVERY_LOCATION_STATE,
} from './mocks';
import { screen, waitFor } from '@testing-library/react';
import { AuthUiError, AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { MOCK_FLOW_ID } from '../Signin/mocks';

const mockLocationHook = jest.fn();
const mockNavigateHook = jest.fn();
jest.mock('@reach/router', () => {
  return {
    ...jest.requireActual('@reach/router'),
    useNavigate: () => mockNavigateHook,
    useLocation: () => mockLocationHook(),
  };
});

const mockSessionHook = jest.fn();
const mockVerifyTotpSetupCode = jest.fn();
const mockSendVerificationCode = jest.fn();
const mockCreateTotpToken = jest.fn();
const mockCheckTotpTokenExists = jest.fn();

jest.mock('../../models', () => {
  return {
    ...jest.requireActual('../../models'),
    useSession: () => mockSessionHook(),
    useAuthClient: () => ({
      verifyTotpSetupCode: mockVerifyTotpSetupCode,
      createTotpToken: mockCreateTotpToken,
      checkTotpTokenExists: mockCheckTotpTokenExists,
    }),
  };
});

jest.mock('../../lib/glean', () => ({
  __esModule: true,
  default: {
    accountPref: {
      twoStepAuthQrCodeSuccess: jest.fn(),
    },
  },
}));

function setMocks() {
  const search = '?' + new URLSearchParams(MOCK_QUERY_PARAMS);

  mockWindowLocation({
    pathname: '/inline_totp_setup',
    search,
  });

  mockLocationHook.mockReturnValue({
    pathname: '/inline_totp_setup',
    search,
    state: MOCK_SIGNIN_LOCATION_STATE,
  });
  mockVerifyTotpSetupCode.mockReset();
  mockSendVerificationCode.mockReset();
  mockCreateTotpToken.mockReset();
  mockCheckTotpTokenExists.mockReset();
  mockSessionHook.mockReturnValue({
    isSessionVerified: async () => true,
    sendVerificationCode: mockSendVerificationCode,
  });
  // Default: TOTP doesn't exist, so we need to create one
  mockCheckTotpTokenExists.mockResolvedValue({ exists: false, verified: false });
  mockCreateTotpToken.mockResolvedValue(MOCK_TOTP_TOKEN);
  jest.spyOn(InlineTotpSetupModule, 'default');
  (InlineTotpSetupModule.default as jest.Mock).mockReset();
  mockNavigateHook.mockReset();
}

const defaultProps = {
  isSignedIn: true,
  integration: {
    type: IntegrationType.OAuthWeb,
    returnOnError: () => true,
    getRedirectWithErrorUrl: (error: AuthUiError) =>
      `https://localhost:8080/?error=${error.errno}`,
  } as OAuthIntegration,
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

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('redirects away', () => {
    it('redirects when user is not signed in', async () => {
      render({ isSignedIn: false });
      const location = mockLocationHook();
      await waitFor(() =>
        expect(mockNavigateHook).toHaveBeenCalledWith(`/${location.search}`, {
          state: undefined,
        })
      );
    });

    it('redirects when there is no signin state', async () => {
      mockLocationHook.mockImplementation(() => {
        return {
          pathname: '/inline_totp_setup',
          search: '?' + new URLSearchParams(MOCK_QUERY_PARAMS),
        };
      });
      const location = mockLocationHook();
      render();
      await waitFor(() => {
        expect(mockNavigateHook).toHaveBeenCalledWith(`/${location.search}`, {
          state: undefined,
        });
      });
    });

    it('redirects when the session is not verified', async () => {
      mockSessionHook.mockImplementationOnce(() => ({
        isSessionVerified: async () => false,
      }));
      render();
      const location = mockLocationHook();
      await waitFor(() => {
        expect(mockNavigateHook).toHaveBeenCalledWith(
          `/signin_token_code${location.search}`,
          { state: MOCK_SIGNIN_LOCATION_STATE }
        );
      });
    });

    it('sends verification code when session is not verified', async () => {
      mockSendVerificationCode.mockResolvedValue(undefined);
      mockSessionHook.mockImplementationOnce(() => ({
        isSessionVerified: async () => false,
        sendVerificationCode: mockSendVerificationCode,
      }));
      render();
      const location = mockLocationHook();
      await waitFor(() => {
        expect(mockSendVerificationCode).toHaveBeenCalled();
        expect(mockNavigateHook).toHaveBeenCalledWith(
          `/signin_token_code${location.search}`,
          { state: MOCK_SIGNIN_LOCATION_STATE }
        );
      });
    });

    it('redirects when totp is active on the account (even if the session is verified)', async () => {
      mockSessionHook.mockImplementationOnce(() => ({
        isSessionVerified: async () => true,
      }));
      mockCheckTotpTokenExists.mockResolvedValue({ exists: true, verified: true });
      render();
      const location = mockLocationHook();
      await waitFor(() => {
        expect(mockNavigateHook).toHaveBeenCalledWith(
          `/signin_totp_code${location.search}`,
          { state: MOCK_SIGNIN_LOCATION_STATE }
        );
      });
    });

    it('redirects when totp is active on the account and the session is not verified', async () => {
      mockSessionHook.mockImplementationOnce(() => ({
        isSessionVerified: async () => false,
      }));
      mockCheckTotpTokenExists.mockResolvedValue({ exists: true, verified: true });
      render();
      const location = mockLocationHook();
      await waitFor(() => {
        expect(mockNavigateHook).toHaveBeenCalledWith(
          `/signin_totp_code${location.search}`,
          { state: MOCK_SIGNIN_LOCATION_STATE }
        );
      });
    });

    it('does not call createTotpToken while TOTP status is loading', async () => {
      // Simulate loading by not resolving the promise
      mockCheckTotpTokenExists.mockImplementation(() => new Promise(() => {}));

      render();

      // Wait a bit to ensure the component has mounted
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockCreateTotpToken).not.toHaveBeenCalled();
    });

    it('does not call createTotpToken when TOTP is already verified', async () => {
      mockSessionHook.mockImplementationOnce(() => ({
        isSessionVerified: async () => true,
      }));
      mockCheckTotpTokenExists.mockResolvedValue({ exists: true, verified: true });

      render();

      await waitFor(() => {
        expect(mockNavigateHook).toHaveBeenCalled();
      });
      expect(mockCreateTotpToken).not.toHaveBeenCalled();
    });
  });

  describe('renders', () => {
    it('displays loading spinner when loading', async () => {
      // Simulate loading by not resolving the promise
      mockCheckTotpTokenExists.mockImplementation(() => new Promise(() => {}));

      render();
      screen.getByLabelText('Loading…');
      expect(InlineTotpSetupModule.default).not.toHaveBeenCalled();
    });

    it('invokes InlineTotpSetup with the correct props', async () => {
      render();
      await waitFor(() => {
        expect(InlineTotpSetupModule.default).toHaveBeenCalled();
        const args = (InlineTotpSetupModule.default as jest.Mock).mock
          .calls[0][0];
        expect(args.totp).toEqual(MOCK_TOTP_TOKEN);
        expect(args.serviceName).toBe(MozServices.Default);
      });
    });

    describe('callbacks', () => {
      describe('verifyCodeHandler', () => {
        it('throws an error when the server rejects the code', async () => {
          mockVerifyTotpSetupCode.mockRejectedValue(new Error('bad'));
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
          mockVerifyTotpSetupCode.mockRejectedValue(new Error('err'));
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
          mockVerifyTotpSetupCode.mockResolvedValue({ success: true });
          render();
          await waitFor(() => {
            expect(InlineTotpSetupModule.default).toHaveBeenCalled();
          });
          const args = (InlineTotpSetupModule.default as jest.Mock).mock
            .calls[0][0];
          const verifyCodeHandler = args.verifyCodeHandler;
          await verifyCodeHandler('1010');
          expect(
            GleanMetrics.accountPref.twoStepAuthQrCodeSuccess
          ).toHaveBeenCalled();
          expect(mockNavigateHook).toHaveBeenCalledWith(
            `/inline_recovery_setup?${new URLSearchParams(MOCK_QUERY_PARAMS)}`,
            { state: MOCK_SIGNIN_RECOVERY_LOCATION_STATE }
          );
        });
      });
    });
  });
});
