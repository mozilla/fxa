/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as InlineRecoverySetupModule from '.';
import * as utils from 'fxa-react/lib/utils';

import { MemoryRouter } from 'react-router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { AuthUiError } from '../../lib/auth-errors/auth-errors';
import { MozServices } from '../../lib/types';
import {
  IntegrationType,
  OAuthIntegration,
  useSensitiveDataClient,
} from '../../models';
import { mockSensitiveDataClient as createMockSensitiveDataClient } from '../../models/mocks';
import {
  MOCK_QUERY_PARAMS,
  MOCK_SIGNIN_LOCATION_STATE,
  MOCK_SIGNIN_RECOVERY_LOCATION_STATE,
} from '../InlineTotpSetup/mocks';
import InlineRecoverySetupContainer from './container';
import AuthClient from 'fxa-auth-client/browser';
import { waitFor } from '@testing-library/react';
import {
  MOCK_CLIENT_ID,
  MOCK_OAUTH_FLOW_HANDLER_RESPONSE,
} from '../Signin/mocks';
import {
  useFinishOAuthFlowHandler,
  useOAuthKeysCheck,
} from '../../lib/oauth/hooks';
import { SensitiveData } from '../../lib/sensitive-data-client';
import { mockWindowLocation } from 'fxa-react/lib/test-utils/mockWindowLocation';
import { ReactNode } from 'react';
import { JwtTokenCache } from '../../lib/cache';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';

// The MFA email-OTP guard is unit-tested separately (MfaGuardCore); here it is a
// pass-through so the recovery setup (its children) renders directly. A mfa:2fa
// JWT is seeded in setMocks so the JWT-guarded completion call resolves.
jest.mock('../../components/Settings/MfaGuard/MfaGuardCore', () => ({
  __esModule: true,
  MfaGuardCore: ({ children }: { children: ReactNode }) => children,
}));

let mockLocationState = {};
const search = '?' + new URLSearchParams(MOCK_QUERY_PARAMS);

mockWindowLocation({
  pathname: '/inline_recovery_setup',
  search,
});

const mockLocationHook = () => {
  return {
    pathname: '/inline_recovery_setup',
    search,
    state: mockLocationState,
  };
};

const mockNavigateHook = jest.fn();
jest.mock('react-router', () => {
  return {
    __esModule: true,
    ...jest.requireActual('react-router'),
    useNavigate: () => mockNavigateHook,
    useLocation: () => mockLocationHook(),
  };
});

jest.mock('../../lib/oauth/hooks.tsx', () => {
  return {
    __esModule: true,
    useFinishOAuthFlowHandler: jest.fn(),
    useOAuthKeysCheck: jest.fn(),
  };
});

const mockSensitiveDataClient = createMockSensitiveDataClient();
mockSensitiveDataClient.getDataType = jest.fn();
const mockAuthClient = new AuthClient('http://localhost:9000', {
  keyStretchVersion: 1,
});
let mockSessionHook: () => any = () => ({ token: 'ABBA' });
let accountRefreshFn = jest.fn();
let recoveryPhoneFn = jest
  .fn()
  .mockImplementationOnce(() => {
    throw Error('no');
  })
  .mockImplementation(() => ({ available: true }));
let addRecoveryPhoneFn = jest
  .fn()
  .mockResolvedValue({ nationalFormat: '+12345678900' });
let confirmRecoveryPhoneFn = jest.fn();
let setRecoveryCodesFn = jest.fn();
let mockAccount = new (class {
  get recoveryPhone() {
    return recoveryPhoneFn();
  }
  async refresh(x: string) {
    return accountRefreshFn(x);
  }
  async addRecoveryPhone(x: string) {
    return addRecoveryPhoneFn(x);
  }
  async confirmRecoveryPhone(...args: any[]) {
    return confirmRecoveryPhoneFn(...args);
  }
  async setRecoveryCodes(codes: string[]) {
    return setRecoveryCodesFn(codes);
  }
})();
jest.mock('../../models', () => {
  return {
    ...jest.requireActual('../../models'),
    useSession: jest.fn(() => mockSessionHook()),
    useAuthClient: jest.fn(() => mockAuthClient),
    useSensitiveDataClient: jest.fn(),
    useAccount: jest.fn(() => mockAccount),
    useConfig: jest.fn(() => ({ recoveryCodes: { count: 8, length: 10 } })),
  };
});

let mockGenerateCodes = jest.fn((...args) => ['wibble', 'quux']);
jest.mock('../../lib/totp-utils', () => {
  return {
    totpUtils: {
      ...jest.requireActual('../../lib/totp-utils').totpUtils,
      generateRecoveryCodes: (...args: any) => mockGenerateCodes(...args),
    },
  };
});

jest.mock('./index', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

let mockCompleteTotpSetupWithJwt = jest.fn().mockResolvedValue({ success: true });
let mockCheckTotpTokenExists = jest.fn();

function setMocks() {
  mockLocationState = {};
  mockSessionHook = () => ({ token: 'ABBA' });
  // Reset generated codes mock between tests to avoid cross-test contamination
  mockGenerateCodes = jest.fn((...args: any[]) => ['wibble', 'quux']);

  // Default: TOTP doesn't exist
  mockCheckTotpTokenExists.mockResolvedValue({ exists: false, verified: false });
  (InlineRecoverySetupModule.default as jest.Mock).mockReset();
  mockNavigateHook.mockReset();
  mockCompleteTotpSetupWithJwt.mockClear();
  mockCheckTotpTokenExists.mockClear();
  (mockAuthClient as any).completeTotpSetupWithJwt = mockCompleteTotpSetupWithJwt;
  (mockAuthClient as any).checkTotpTokenExists = mockCheckTotpTokenExists;
  // Seed the mfa:2fa JWT the completion reads (obtained by the guard via email
  // OTP; pre-seeded here so the guard pass-through renders the flow).
  JwtTokenCache.setToken(
    MOCK_SIGNIN_RECOVERY_LOCATION_STATE.sessionToken,
    '2fa',
    'test-jwt'
  );
  (useFinishOAuthFlowHandler as jest.Mock).mockImplementation(() => ({
    finishOAuthFlowHandler: jest
      .fn()
      .mockReturnValueOnce(MOCK_OAUTH_FLOW_HANDLER_RESPONSE),
    oAuthDataError: null,
  }));
  (useSensitiveDataClient as jest.Mock).mockImplementation(
    () => mockSensitiveDataClient
  );
  (useOAuthKeysCheck as jest.Mock).mockImplementation(() => ({
    oAuthKeysCheckError: null,
  }));
  recoveryPhoneFn.mockClear();
  confirmRecoveryPhoneFn.mockClear();
}

const defaultProps = {
  isSignedIn: true,
  integration: {
    type: IntegrationType.OAuthWeb,
    returnOnError: () => true,
    getService: () => undefined,
    getClientId: () => MOCK_CLIENT_ID,
    getRedirectWithErrorUrl: (error: AuthUiError) =>
      `https://localhost:8080/?error=${error.errno}`,
    getCmsInfo: () => undefined,
  } as OAuthIntegration,
  serviceName: MozServices.Default,
};

function render(props = {}) {
  renderWithLocalizationProvider(
    <MemoryRouter>
      <InlineRecoverySetupContainer {...{ ...defaultProps, ...props }} />
    </MemoryRouter>
  );
}

describe('InlineRecoverySetupContainer', () => {
  beforeEach(() => {
    setMocks();
  });

  describe('redirects away', () => {
    it('redirects when user is not signed in', async () => {
      mockLocationState = MOCK_SIGNIN_RECOVERY_LOCATION_STATE;
      render({ isSignedIn: false });
      await waitFor(() => {
        expect(mockNavigateHook).toHaveBeenCalledWith(`/signup${search}`);
      });
    });

    it('redirects when there is no signin state', async () => {
      render();
      await waitFor(() => {
        expect(mockNavigateHook).toHaveBeenCalledWith(`/signup${search}`);
      });
    });

    it('redirects when there is no totp token', async () => {
      mockLocationState = MOCK_SIGNIN_LOCATION_STATE;
      render();
      await waitFor(() => {
        expect(mockNavigateHook).toHaveBeenCalledWith(`/signup${search}`);
      });
    });

    it('redirects when totp is already active', async () => {
      mockSessionHook = () => ({ isSessionVerified: async () => true });
      mockCheckTotpTokenExists.mockResolvedValue({ exists: true, verified: true });
      mockLocationState = MOCK_SIGNIN_RECOVERY_LOCATION_STATE;

      render();
      await waitFor(() => {
        expect(mockNavigateHook).toHaveBeenCalledWith(
          `/signin_totp_code${search}`,
          {
            state: MOCK_SIGNIN_LOCATION_STATE,
          }
        );
      });
    });
  });

  describe('renders', () => {
    beforeEach(() => {
      mockLocationState = {
        ...MOCK_SIGNIN_RECOVERY_LOCATION_STATE,
        totp: {
          ...MOCK_SIGNIN_RECOVERY_LOCATION_STATE.totp,
          recoveryCodes: [],
        },
      };
    });

    it('invokes InlineRecoverySetup with the correct props', async () => {
      render();
      await waitFor(() => {
        expect(InlineRecoverySetupModule.default).toHaveBeenCalled();
        // Get the most recent call since codes may be generated
        const calls = (InlineRecoverySetupModule.default as jest.Mock).mock.calls;
        const args = calls[calls.length - 1][0];
        // Codes are auto-generated now, so they may already be populated
        expect(args.serviceName).toBe(defaultProps.serviceName);
        expect(args.email).toBe(MOCK_SIGNIN_RECOVERY_LOCATION_STATE.email);
        expect(args.currentStep).toBe(1);
        expect(args.backupMethod).toBe(null);
      });
    });

    it('loads the account', async () => {
      render();
      await waitFor(() => {
        expect(accountRefreshFn).toHaveBeenCalledWith('account');
      });
    });

    it('sets flowHasPhoneChoice to false when recovery phone is not available', async () => {
      recoveryPhoneFn = jest.fn().mockReturnValue({ available: false });

      render();
      await waitFor(() => {
        expect(InlineRecoverySetupModule.default).toHaveBeenCalled();
        const args = (InlineRecoverySetupModule.default as jest.Mock).mock
          .calls[0][0];
        expect(args.flowHasPhoneChoice).toBe(false);
      });
    });

    it('shows code-download flow first and generates codes when phone is unavailable', async () => {
      recoveryPhoneFn = jest.fn().mockReturnValue({ available: false });

      render();

      // After codes finish generating, props should reflect the new codes
      await waitFor(() => {
        expect(mockGenerateCodes).toHaveBeenCalled();
        expect(InlineRecoverySetupModule.default).toHaveBeenCalled();
        const args = (
          InlineRecoverySetupModule.default as jest.Mock
        ).mock.calls.slice(-1)[0][0];
        expect(args.flowHasPhoneChoice).toBe(false);
        expect(args.generatingCodes).toBe(false);
        expect(args.backupCodes).toEqual(['wibble', 'quux']);
      });
    });

    it('reads data from sensitive data client', async () => {
      render();
      await waitFor(() => {
        expect(mockSensitiveDataClient.getDataType).toHaveBeenCalledWith(
          SensitiveData.Key.Auth
        );
      });
    });

    it('completes setup with the protocol service value, not the display serviceName', async () => {
      // The server's `service` validator rejects display labels like
      // "Firefox Sync" (spaces, > 16 chars); the protocol value from
      // getService() ("sync") must be sent instead.
      render({
        integration: {
          ...defaultProps.integration,
          getService: () => 'sync',
        },
        serviceName: MozServices.FirefoxSync,
      });
      const latestArgs = () =>
        (InlineRecoverySetupModule.default as jest.Mock).mock.calls.slice(
          -1
        )[0][0];
      await waitFor(() => {
        expect(InlineRecoverySetupModule.default).toHaveBeenCalled();
      });
      await waitFor(async () => {
        await latestArgs().backupChoiceCb('code');
      });
      await waitFor(async () => {
        await latestArgs().completeBackupCodeSetup('wibble');
      });
      expect(mockCompleteTotpSetupWithJwt).toHaveBeenCalledWith('test-jwt', {
        service: 'sync',
      });
    });

    describe('callbacks', () => {
      let args: any;

      beforeEach(async () => {
        render();
        await waitFor(() => {
          expect(InlineRecoverySetupModule.default).toHaveBeenCalled();
        });
        args = (InlineRecoverySetupModule.default as jest.Mock).mock
          .calls[0][0];
      });

      describe('backupChoiceCb', () => {
        it('creates recovery codes when code is selected', async () => {
          await waitFor(async () => {
            await args.backupChoiceCb('code');
          });
          expect(mockGenerateCodes).toHaveBeenCalledWith(8, 10);
        });
      });

      describe('verifyPhoneNumber, sendSmsCode, and verifySmsCode', () => {
        it('adds phone number and enables totp', async () => {
          await waitFor(async () => {
            await args.verifyPhoneNumber('12345678900');
          });
          args = (InlineRecoverySetupModule.default as jest.Mock).mock.calls[
            (InlineRecoverySetupModule.default as jest.Mock).mock.calls.length -
              1
          ][0];
          await waitFor(async () => {
            await args.sendSmsCode();
          });
          expect(addRecoveryPhoneFn).toHaveBeenCalledTimes(2);
          expect(addRecoveryPhoneFn).toHaveBeenNthCalledWith(1, '12345678900');
          expect(addRecoveryPhoneFn).toHaveBeenNthCalledWith(2, '12345678900');

          await waitFor(async () => {
            await args.verifySmsCode('010431');
          });
          expect(confirmRecoveryPhoneFn).toHaveBeenCalledWith(
            '010431',
            '12345678900'
          );
          expect(mockCompleteTotpSetupWithJwt).toHaveBeenCalledTimes(1);
        });

        it('rejects (so the flow does not advance) when TOTP completion fails', async () => {
          // If completion fails the confirm-code step must not navigate forward
          // to the success screen while 2FA is still disabled.
          mockCompleteTotpSetupWithJwt.mockRejectedValueOnce(
            new Error('server error')
          );
          await waitFor(async () => {
            await args.verifyPhoneNumber('12345678900');
          });
          args = (InlineRecoverySetupModule.default as jest.Mock).mock.calls[
            (InlineRecoverySetupModule.default as jest.Mock).mock.calls.length - 1
          ][0];

          await expect(args.verifySmsCode('010431')).rejects.toThrow(
            'cannot enable TOTP'
          );
        });

        it('does not re-consume the SMS code when retrying after a failed completion', async () => {
          await waitFor(async () => {
            await args.verifyPhoneNumber('12345678900');
          });
          args = (InlineRecoverySetupModule.default as jest.Mock).mock.calls[
            (InlineRecoverySetupModule.default as jest.Mock).mock.calls.length - 1
          ][0];

          // First attempt: phone confirms, then TOTP completion fails.
          mockCompleteTotpSetupWithJwt.mockRejectedValueOnce(
            new Error('server error')
          );
          await expect(args.verifySmsCode('010431')).rejects.toThrow(
            'cannot enable TOTP'
          );

          // Retry (fresh JWT): completion succeeds. The single-use SMS code must
          // not be submitted again, or the phone confirm would fail.
          await args.verifySmsCode('010431');

          expect(confirmRecoveryPhoneFn).toHaveBeenCalledTimes(1);
          expect(mockCompleteTotpSetupWithJwt).toHaveBeenCalledTimes(2);
        });
      });

      describe('completeBackupCodeSetup', () => {
        it('sets recovery codes and enables totp', async () => {
          await waitFor(async () => {
            await args.backupChoiceCb('code');
          });
          args = (InlineRecoverySetupModule.default as jest.Mock).mock.calls[
            (InlineRecoverySetupModule.default as jest.Mock).mock.calls.length -
              1
          ][0];
          await waitFor(async () => {
            await args.completeBackupCodeSetup('wibble');
          });
          expect(setRecoveryCodesFn).toHaveBeenCalledWith(['wibble', 'quux']);
          expect(mockCompleteTotpSetupWithJwt).toHaveBeenCalledTimes(1);
        });

        it('clears the cached JWT when completion fails with an invalid MFA token', async () => {
          const invalidJwtError = Object.assign(new Error('invalid mfa token'), {
            errno: AuthUiErrors.INVALID_MFA_TOKEN.errno,
          });
          mockCompleteTotpSetupWithJwt.mockRejectedValueOnce(invalidJwtError);

          expect(
            JwtTokenCache.hasToken(
              MOCK_SIGNIN_RECOVERY_LOCATION_STATE.sessionToken,
              '2fa'
            )
          ).toBe(true);

          await waitFor(async () => {
            await args.backupChoiceCb('code');
          });
          args = (InlineRecoverySetupModule.default as jest.Mock).mock.calls[
            (InlineRecoverySetupModule.default as jest.Mock).mock.calls.length - 1
          ][0];
          await waitFor(async () => {
            await args.completeBackupCodeSetup('wibble');
          });

          // Stale JWT dropped so MfaGuardCore can re-prompt for a fresh email OTP
          // instead of dead-ending the recovery step.
          expect(
            JwtTokenCache.hasToken(
              MOCK_SIGNIN_RECOVERY_LOCATION_STATE.sessionToken,
              '2fa'
            )
          ).toBe(false);
        });
      });

      describe('successfulSetupHandler', () => {
        it('calls finishOAuthFlowHandler and navigates to RP', async () => {
          const hardNavigateSpy = jest
            .spyOn(utils, 'hardNavigate')
            .mockImplementation(() => {});

          const successfulSetupHandler = args.successfulSetupHandler;
          await waitFor(async () => {
            await successfulSetupHandler();
          });

          expect(hardNavigateSpy).toHaveBeenCalledWith(
            MOCK_OAUTH_FLOW_HANDLER_RESPONSE.redirect
          );
        });
      });
    });
  });
});
