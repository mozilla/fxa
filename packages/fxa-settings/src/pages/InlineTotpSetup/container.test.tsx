/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as InlineTotpSetupModule from '.';
import { mockWindowLocation } from 'fxa-react/lib/test-utils/mockWindowLocation';

import { MemoryRouter } from 'react-router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { MozServices } from '../../lib/types';
import { IntegrationType, OAuthIntegration } from '../../models';
import InlineTotpSetupContainer from './container';
import GleanMetrics from '../../lib/glean';
import {
  MOCK_TOTP_TOKEN,
  MOCK_QUERY_PARAMS,
  MOCK_SIGNIN_LOCATION_STATE,
  MOCK_SIGNIN_LOCATION_STATE_PASSKEY,
  MOCK_SIGNIN_RECOVERY_LOCATION_STATE,
} from './mocks';
import { screen, waitFor } from '@testing-library/react';
import { AuthUiError, AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { MOCK_FLOW_ID } from '../Signin/mocks';
import { ReactNode } from 'react';
import { JwtTokenCache } from '../../lib/cache';

const mockLocationHook = jest.fn();
const mockNavigateHook = jest.fn();
jest.mock('react-router', () => {
  return {
    ...jest.requireActual('react-router'),
    useNavigate: () => mockNavigateHook,
    useLocation: () => mockLocationHook(),
  };
});

const mockSessionHook = jest.fn();
const mockVerifyTotpSetupCodeWithJwt = jest.fn();
const mockSendVerificationCode = jest.fn();
const mockCreateTotpTokenWithJwt = jest.fn();
const mockCheckTotpTokenExists = jest.fn();

jest.mock('../../models', () => {
  return {
    ...jest.requireActual('../../models'),
    useSession: () => mockSessionHook(),
    useAuthClient: () => ({
      verifyTotpSetupCodeWithJwt: mockVerifyTotpSetupCodeWithJwt,
      createTotpTokenWithJwt: mockCreateTotpTokenWithJwt,
      checkTotpTokenExists: mockCheckTotpTokenExists,
    }),
  };
});

// The MFA email-OTP guard is unit-tested separately (MfaGuardCore); here it is a
// pass-through so the enrolment (its children) renders directly. A mfa:2fa JWT
// is seeded in setMocks so the JWT-guarded enrolment calls resolve.
jest.mock('../../components/Settings/MfaGuard', () => ({
  __esModule: true,
  MfaGuardCore: ({ children }: { children: ReactNode }) => children,
}));

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
  mockVerifyTotpSetupCodeWithJwt.mockReset();
  mockSendVerificationCode.mockReset();
  mockCreateTotpTokenWithJwt.mockReset();
  mockCheckTotpTokenExists.mockReset();
  mockSessionHook.mockReturnValue({
    isSessionVerified: async () => true,
    sendVerificationCode: mockSendVerificationCode,
  });
  // Default: TOTP doesn't exist, so we need to create one
  mockCheckTotpTokenExists.mockResolvedValue({ exists: false, verified: false });
  mockCreateTotpTokenWithJwt.mockResolvedValue(MOCK_TOTP_TOKEN);
  // Seed the mfa:2fa JWT the enrolment reads (the guard would have obtained it
  // via email OTP; here it's pre-seeded so the guard pass-through renders).
  JwtTokenCache.setToken(
    MOCK_SIGNIN_LOCATION_STATE.sessionToken,
    '2fa',
    'test-jwt'
  );
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
    <MemoryRouter>
      <InlineTotpSetupContainer
        {...{
          ...defaultProps,
          ...props,
          flowQueryParams: { flowId: MOCK_FLOW_ID },
        }}
      />
    </MemoryRouter>
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
      mockCheckTotpTokenExists.mockResolvedValue({
        exists: true,
        verified: true,
      });
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
      mockCheckTotpTokenExists.mockResolvedValue({
        exists: true,
        verified: true,
      });
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
      expect(mockCreateTotpTokenWithJwt).not.toHaveBeenCalled();
    });

    it('does not call createTotpToken when TOTP is already verified', async () => {
      mockSessionHook.mockImplementationOnce(() => ({
        isSessionVerified: async () => true,
      }));
      mockCheckTotpTokenExists.mockResolvedValue({
        exists: true,
        verified: true,
      });

      render();

      await waitFor(() => {
        expect(mockNavigateHook).toHaveBeenCalled();
      });
      expect(mockCreateTotpTokenWithJwt).not.toHaveBeenCalled();
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

    it('passes signedInWithPasskey when the signin state came from a passkey ceremony', async () => {
      mockLocationHook.mockReturnValue({
        pathname: '/inline_totp_setup',
        search: '?' + new URLSearchParams(MOCK_QUERY_PARAMS),
        state: MOCK_SIGNIN_LOCATION_STATE_PASSKEY,
      });

      render();

      await waitFor(() => {
        expect(InlineTotpSetupModule.default).toHaveBeenCalled();
      });
      const args = (InlineTotpSetupModule.default as jest.Mock).mock
        .calls[0][0];
      expect(args.signedInWithPasskey).toBe(true);
    });

    it('passes signedInWithPasskey as false for a non-passkey signin state', async () => {
      render();

      await waitFor(() => {
        expect(InlineTotpSetupModule.default).toHaveBeenCalled();
      });
      const args = (InlineTotpSetupModule.default as jest.Mock).mock
        .calls[0][0];
      expect(args.signedInWithPasskey).toBe(false);
    });

    describe('callbacks', () => {
      describe('verifyCodeHandler', () => {
        it('throws an error when the server rejects the code', async () => {
          mockVerifyTotpSetupCodeWithJwt.mockRejectedValue(new Error('bad'));
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
          mockVerifyTotpSetupCodeWithJwt.mockRejectedValue(new Error('err'));
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

        it('clears the cached JWT and rethrows the original error when the MFA token is invalid', async () => {
          const invalidJwtError = Object.assign(new Error('invalid mfa token'), {
            errno: AuthUiErrors.INVALID_MFA_TOKEN.errno,
          });
          mockVerifyTotpSetupCodeWithJwt.mockRejectedValue(invalidJwtError);
          render();
          await waitFor(() => {
            expect(InlineTotpSetupModule.default).toHaveBeenCalled();
          });
          const args = (InlineTotpSetupModule.default as jest.Mock).mock
            .calls[0][0];
          const verifyCodeHandler = args.verifyCodeHandler;

          expect(
            JwtTokenCache.hasToken(MOCK_SIGNIN_LOCATION_STATE.sessionToken, '2fa')
          ).toBe(true);

          // Rethrown as-is, not mislabeled as INVALID_TOTP_CODE.
          await expect(verifyCodeHandler('1010')).rejects.toBe(invalidJwtError);

          // Token dropped so MfaGuardCore re-prompts for a fresh email OTP
          // instead of retrying the dead JWT.
          expect(
            JwtTokenCache.hasToken(MOCK_SIGNIN_LOCATION_STATE.sessionToken, '2fa')
          ).toBe(false);
        });

        it('redirects to inline_recovery_setup when the code is valid', async () => {
          mockVerifyTotpSetupCodeWithJwt.mockResolvedValue({ success: true });
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
