/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, renderHook } from '@testing-library/react-hooks';
import * as Sentry from '@sentry/browser';
import { FtlMsgResolver } from 'fxa-react/lib/utils';
import {
  usePasskeySignIn,
  type PasskeySignInAuthClient,
  type PasskeySignInIntegration,
} from './signin-flow';
import { getCredential, isWebAuthnLevel3Supported } from './webauthn';
import { storeAccountData } from '../storage-utils';
import { AuthUiErrors } from '../auth-errors/auth-errors';
import GleanMetrics from '../glean';
import { IntegrationType } from '../../models';
import {
  ensureCanLinkAcountOrRedirect,
  handleNavigation,
} from '../../pages/Signin/utils';

jest.mock('./webauthn', () => ({
  __esModule: true,
  ...jest.requireActual('./webauthn'),
  isWebAuthnLevel3Supported: jest.fn(),
  getCredential: jest.fn(),
}));

jest.mock('../../pages/Signin/utils', () => ({
  __esModule: true,
  ensureCanLinkAcountOrRedirect: jest.fn(),
  handleNavigation: jest.fn(),
}));

jest.mock('@sentry/browser', () => ({
  __esModule: true,
  captureException: jest.fn(),
}));

jest.mock('../storage-utils', () => ({
  __esModule: true,
  storeAccountData: jest.fn(),
}));

jest.mock('../glean', () => ({
  __esModule: true,
  default: {
    emailFirst: {
      passkeySubmit: jest.fn(),
      passkeySubmitFrontendError: jest.fn(),
      passkeySubmitSuccess: jest.fn(),
    },
    login: {
      passkeySubmit: jest.fn(),
      passkeySubmitFrontendError: jest.fn(),
      passkeySubmitSuccess: jest.fn(),
      alternativeAuthPasskeySubmit: jest.fn(),
      alternativeAuthPasskeySubmitFrontendError: jest.fn(),
      alternativeAuthPasskeySubmitSuccess: jest.fn(),
    },
    passwordlessLogin: {
      passkeySubmit: jest.fn(),
      passkeySubmitFrontendError: jest.fn(),
      passkeySubmitSuccess: jest.fn(),
    },
    passkey: {
      authSuccess: jest.fn(),
    },
  },
}));

type PasskeyEventMocks = {
  passkeySubmit: jest.Mock;
  passkeySubmitFrontendError: jest.Mock;
  passkeySubmitSuccess: jest.Mock;
};

const gleanForSurface = (
  surface: 'emailfirst' | 'login' | 'login_otp' | 'alternative_auth'
): PasskeyEventMocks => {
  if (surface === 'emailfirst')
    return GleanMetrics.emailFirst as unknown as PasskeyEventMocks;
  if (surface === 'login')
    return GleanMetrics.login as unknown as PasskeyEventMocks;
  if (surface === 'alternative_auth') {
    const loginMocks = GleanMetrics.login as unknown as {
      alternativeAuthPasskeySubmit: jest.Mock;
      alternativeAuthPasskeySubmitFrontendError: jest.Mock;
      alternativeAuthPasskeySubmitSuccess: jest.Mock;
    };
    return {
      passkeySubmit: loginMocks.alternativeAuthPasskeySubmit,
      passkeySubmitFrontendError:
        loginMocks.alternativeAuthPasskeySubmitFrontendError,
      passkeySubmitSuccess: loginMocks.alternativeAuthPasskeySubmitSuccess,
    };
  }
  return GleanMetrics.passwordlessLogin as unknown as PasskeyEventMocks;
};

const SESSION_TOKEN = 'session-token';
const UID = 'uid-123';
const EMAIL = 'user@example.com';
const CHALLENGE = 'mock-challenge';
const MOCK_CREDENTIAL = {
  id: 'cred-id',
  rawId: 'cred-raw-id',
  type: 'public-key',
  response: {},
  clientExtensionResults: {},
};

const buildArgs = (
  overrides: Partial<Parameters<typeof usePasskeySignIn>[0]> = {}
) => {
  const beginPasskeyAuthentication = jest
    .fn()
    .mockResolvedValue({ challenge: CHALLENGE, userVerification: 'required' });
  const completePasskeyAuthentication = jest.fn().mockResolvedValue({
    uid: UID,
    sessionToken: SESSION_TOKEN,
    verified: true,
    requiresPasswordForSync: false,
    hasPassword: true,
  });
  const account = jest.fn().mockResolvedValue({
    emails: [{ email: EMAIL, isPrimary: true, verified: true }],
    totp: { exists: false, verified: false },
  });

  const authClient = {
    beginPasskeyAuthentication,
    completePasskeyAuthentication,
    account,
  } as jest.Mocked<PasskeySignInAuthClient>;
  const integration = {
    isSync: () => false,
    isFirefoxNonSync: () => false,
    getService: () => undefined,
    getClientId: () => 'service-id',
    type: IntegrationType.OAuthWeb,
    data: {},
    wantsTwoStepAuthentication: () => false,
  } as unknown as PasskeySignInIntegration;
  const finishOAuthFlowHandler = jest.fn();
  const ftlMsgResolver = {
    getMsg: jest.fn((_id: string, fallback: string) => fallback),
  } as unknown as FtlMsgResolver;
  const navigateWithQuery = jest.fn();

  return {
    args: {
      integration,
      authClient,
      finishOAuthFlowHandler,
      ftlMsgResolver,
      navigateWithQuery,
      queryParams: '',
      surface: 'emailfirst' as const,
      ...overrides,
    },
    spies: {
      beginPasskeyAuthentication,
      completePasskeyAuthentication,
      account,
      finishOAuthFlowHandler,
      ftlMsgResolver,
      navigateWithQuery,
    },
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  (isWebAuthnLevel3Supported as jest.Mock).mockReturnValue(true);
  (getCredential as jest.Mock).mockResolvedValue(MOCK_CREDENTIAL);
  (ensureCanLinkAcountOrRedirect as jest.Mock).mockResolvedValue(true);
  (handleNavigation as jest.Mock).mockResolvedValue({ error: undefined });
});

describe('usePasskeySignIn', () => {
  it('shows a banner and skips the ceremony when WebAuthn is unsupported', async () => {
    (isWebAuthnLevel3Supported as jest.Mock).mockReturnValue(false);
    const { args, spies } = buildArgs();

    const { result } = renderHook(() => usePasskeySignIn(args));

    await act(async () => {
      result.current.onClick();
    });

    expect(spies.beginPasskeyAuthentication).not.toHaveBeenCalled();
    expect(result.current.errorBanner).toBeDefined();
    expect(spies.ftlMsgResolver.getMsg).toHaveBeenCalledWith(
      'passkey-authentication-error-not-supported-v2',
      'Your browser or device doesn’t support passkeys.'
    );
  });

  it('completes the OAuth flow via handleNavigation when no Sync password is required', async () => {
    const { args, spies } = buildArgs();

    const { result } = renderHook(() => usePasskeySignIn(args));

    await act(async () => {
      await result.current.onClick();
    });

    expect(spies.beginPasskeyAuthentication).toHaveBeenCalledTimes(1);
    expect(spies.completePasskeyAuthentication).toHaveBeenCalledWith(
      MOCK_CREDENTIAL,
      CHALLENGE,
      { service: 'service-id', metricsContext: {} }
    );
    expect(spies.account).toHaveBeenCalledWith(SESSION_TOKEN);
    expect(handleNavigation).toHaveBeenCalledWith({
      email: EMAIL,
      signinData: {
        uid: UID,
        sessionToken: SESSION_TOKEN,
        emailVerified: true,
        sessionVerified: true,
        verificationMethod: undefined,
        verificationReason: undefined,
      },
      integration: args.integration,
      finishOAuthFlowHandler: spies.finishOAuthFlowHandler,
      queryParams: '',
      handleFxaLogin: true,
      handleFxaOAuthLogin: true,
      performNavigation: true,
      isPasskeySession: true,
      accountHasTotp: false,
    });
    expect(storeAccountData).toHaveBeenCalledWith({
      email: EMAIL,
      uid: UID,
      lastLogin: expect.any(Number),
      sessionToken: SESSION_TOKEN,
      verified: true,
      sessionVerified: true,
      hasPassword: true,
    });
  });

  it('forwards the Firefox service name (not the client id) for a Sync sign-in', async () => {
    const { args, spies } = buildArgs({
      integration: {
        isSync: () => true,
        isFirefoxNonSync: () => false,
        getService: () => 'sync',
        getClientId: () => 'client-id-should-not-be-used',
        type: IntegrationType.OAuthNative,
        data: {},
        wantsTwoStepAuthentication: () => false,
      } as unknown as PasskeySignInIntegration,
    });

    const { result } = renderHook(() => usePasskeySignIn(args));
    await act(async () => {
      await result.current.onClick();
    });

    expect(spies.completePasskeyAuthentication).toHaveBeenCalledWith(
      MOCK_CREDENTIAL,
      CHALLENGE,
      { service: 'sync', metricsContext: {} }
    );
  });

  it('routes non-OAuth Web integrations through handleNavigation', async () => {
    // Soft-navigate to /settings happens inside handleNavigation (same path
    // as password sign-in). hardNavigate would cause a cached-signin flash.
    const { args, spies } = buildArgs({
      integration: {
        isSync: () => false,
        isFirefoxNonSync: () => false,
        getService: () => undefined,
        getClientId: () => 'service-id',
        type: IntegrationType.Web,
        data: {},
      } as unknown as PasskeySignInIntegration,
    });

    const { result } = renderHook(() => usePasskeySignIn(args));

    await act(async () => {
      await result.current.onClick();
    });

    expect(spies.completePasskeyAuthentication).toHaveBeenCalledWith(
      MOCK_CREDENTIAL,
      CHALLENGE,
      { metricsContext: {} }
    );
    expect(storeAccountData).toHaveBeenCalled();
    expect(handleNavigation).toHaveBeenCalledWith({
      email: EMAIL,
      signinData: {
        uid: UID,
        sessionToken: SESSION_TOKEN,
        emailVerified: true,
        sessionVerified: true,
        verificationMethod: undefined,
        verificationReason: undefined,
      },
      integration: args.integration,
      finishOAuthFlowHandler: spies.finishOAuthFlowHandler,
      queryParams: '',
      handleFxaLogin: true,
      handleFxaOAuthLogin: true,
      performNavigation: true,
      isPasskeySession: true,
      accountHasTotp: false,
    });
  });

  it('runs the Sync merge gate and aborts when the user cancels', async () => {
    (ensureCanLinkAcountOrRedirect as jest.Mock).mockResolvedValue(false);
    const { args, spies } = buildArgs({
      integration: {
        isSync: () => true,
        isFirefoxNonSync: () => false,
        getService: () => 'sync',
        type: IntegrationType.OAuthNative,
        data: {},
      } as unknown as PasskeySignInIntegration,
    });

    const { result } = renderHook(() => usePasskeySignIn(args));

    await act(async () => {
      await result.current.onClick();
    });

    expect(ensureCanLinkAcountOrRedirect).toHaveBeenCalled();
    expect(handleNavigation).not.toHaveBeenCalled();
    expect(spies.navigateWithQuery).not.toHaveBeenCalled();
    // Merge gate runs before persistence — cancelling must not leave a
    // ghost session in localStorage.
    expect(storeAccountData).not.toHaveBeenCalled();
  });

  it.each([
    [
      true,
      '/signin_passkey_fallback',
      { state: { passkeySurface: 'emailfirst' } },
    ],
    [
      false,
      '/post_verify/set_password',
      {
        state: {
          passwordCreationReason: 'passkey',
          passkeySurface: 'emailfirst',
        },
      },
    ],
  ])(
    'routes Sync sign-ins (hasPassword=%s) to %s with surface-aware state',
    async (hasPassword, expectedPath, expectedOptions) => {
      const { args, spies } = buildArgs({
        integration: {
          isSync: () => true,
          isFirefoxNonSync: () => false,
          getService: () => 'sync',
          type: IntegrationType.OAuthNative,
          data: {},
        } as unknown as PasskeySignInIntegration,
      });
      spies.completePasskeyAuthentication.mockResolvedValue({
        uid: UID,
        sessionToken: SESSION_TOKEN,
        verified: true,
        requiresPasswordForSync: true,
        hasPassword,
      });

      const { result } = renderHook(() => usePasskeySignIn(args));

      await act(async () => {
        await result.current.onClick();
      });

      expect(spies.navigateWithQuery).toHaveBeenCalledWith(
        expectedPath,
        expectedOptions
      );
      expect(handleNavigation).not.toHaveBeenCalled();
    }
  );

  it('sends service=sync for Sync integrations even when the service URL param is absent', async () => {
    // Mobile Firefox omits service=sync and defaults via clientId, so
    // getService() returns undefined; isSync() must still drive service=sync.
    const { args, spies } = buildArgs({
      integration: {
        isSync: () => true,
        isFirefoxNonSync: () => false,
        getService: () => undefined,
        type: IntegrationType.OAuthNative,
        data: {},
      } as unknown as PasskeySignInIntegration,
    });

    const { result } = renderHook(() => usePasskeySignIn(args));

    await act(async () => {
      await result.current.onClick();
    });

    expect(spies.completePasskeyAuthentication).toHaveBeenCalledWith(
      MOCK_CREDENTIAL,
      CHALLENGE,
      { service: 'sync', metricsContext: {} }
    );
  });

  // Locks the contract: each DOMException name maps to its expected FTL id
  // AND its fallback string. Drift in either lands silently otherwise.
  // The fallback substrings are stable phrases pulled from webauthn-errors.ts
  // — robust to minor copy edits, strict on intent.
  it.each([
    [
      'NotAllowedError',
      'passkey-authentication-error-not-allowed',
      'Sign-in with passkey failed',
    ],
    [
      'AbortError',
      'passkey-authentication-error-not-allowed',
      'Sign-in with passkey failed',
    ],
    ['TimeoutError', 'passkey-authentication-error-timeout', 'timed out'],
    [
      'NotSupportedError',
      'passkey-authentication-error-not-supported-v2',
      'support passkeys',
    ],
    ['SecurityError', 'passkey-authentication-error-security', 'this page'],
    [
      'InvalidStateError',
      'passkey-authentication-error-invalid-state',
      'wrong with your passkey',
    ],
    [
      'NotReadableError',
      'passkey-authentication-error-not-readable',
      'access the authenticator',
    ],
  ])(
    'categorises WebAuthn DOMException %s and surfaces %s',
    async (errorName, expectedFtlId, fallbackSubstring) => {
      (getCredential as jest.Mock).mockRejectedValue(
        new DOMException('cancelled', errorName)
      );
      const { args, spies } = buildArgs();

      const { result } = renderHook(() => usePasskeySignIn(args));

      await act(async () => {
        await result.current.onClick();
      });

      expect(handleNavigation).not.toHaveBeenCalled();
      expect(result.current.errorBanner).toBeDefined();
      expect(spies.ftlMsgResolver.getMsg).toHaveBeenCalledWith(
        expectedFtlId,
        expect.stringContaining(fallbackSubstring)
      );
    }
  );

  it('treats beginPasskeyAuthentication rejection as a server error', async () => {
    const { args, spies } = buildArgs();
    spies.beginPasskeyAuthentication.mockRejectedValue(
      new Error('network down')
    );

    const { result } = renderHook(() => usePasskeySignIn(args));

    await act(async () => {
      await result.current.onClick();
    });

    expect(result.current.errorBanner).toBeDefined();
    expect(spies.completePasskeyAuthentication).not.toHaveBeenCalled();
    expect(spies.ftlMsgResolver.getMsg).toHaveBeenCalledWith(
      'passkey-authentication-error-unexpected',
      expect.stringContaining('Something went wrong')
    );
    expect(Sentry.captureException as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'passkey-signin error' }),
      { tags: { errno: 'none' } }
    );
  });

  it('re-throws non-WebAuthn errors from getCredential to the generic handler', async () => {
    // Non-DOMException/TypeError errors must bubble to the outer catch, not
    // the WebAuthn categoriser.
    (getCredential as jest.Mock).mockRejectedValue(
      new Error('unexpected sync failure')
    );
    const { args, spies } = buildArgs();

    const { result } = renderHook(() => usePasskeySignIn(args));

    await act(async () => {
      await result.current.onClick();
    });

    expect(result.current.errorBanner).toBeDefined();
    expect(spies.completePasskeyAuthentication).not.toHaveBeenCalled();
    expect(spies.ftlMsgResolver.getMsg).toHaveBeenCalledWith(
      'passkey-authentication-error-unexpected',
      expect.stringContaining('Something went wrong')
    );
    expect(Sentry.captureException as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'passkey-signin error' }),
      { tags: { errno: 'none' } }
    );
  });

  it('treats unknown thrown errors as a server error', async () => {
    const { args, spies } = buildArgs();
    spies.completePasskeyAuthentication.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => usePasskeySignIn(args));

    await act(async () => {
      await result.current.onClick();
    });

    expect(result.current.errorBanner).toBeDefined();
    expect(spies.ftlMsgResolver.getMsg).toHaveBeenCalledWith(
      'passkey-authentication-error-unexpected',
      expect.stringContaining('Something went wrong')
    );
    expect(Sentry.captureException as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'passkey-signin error' }),
      { tags: { errno: 'none' } }
    );
  });

  it('treats account rejection as a server error and skips persistence', async () => {
    const { args, spies } = buildArgs();
    spies.account.mockRejectedValue(new Error('account fetch failed'));

    const { result } = renderHook(() => usePasskeySignIn(args));

    await act(async () => {
      await result.current.onClick();
    });

    expect(result.current.errorBanner).toBeDefined();
    expect(storeAccountData).not.toHaveBeenCalled();
    expect(handleNavigation).not.toHaveBeenCalled();
    expect(spies.ftlMsgResolver.getMsg).toHaveBeenCalledWith(
      'passkey-authentication-error-unexpected',
      expect.stringContaining('Something went wrong')
    );
    expect(Sentry.captureException as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'passkey-signin error' }),
      { tags: { errno: 'none' } }
    );
  });

  it('treats an account response with no primary email as a server error', async () => {
    const { args, spies } = buildArgs();
    spies.account.mockResolvedValue({ emails: [] });

    const { result } = renderHook(() => usePasskeySignIn(args));

    await act(async () => {
      await result.current.onClick();
    });

    expect(result.current.errorBanner).toBeDefined();
    expect(storeAccountData).not.toHaveBeenCalled();
    expect(handleNavigation).not.toHaveBeenCalled();
    expect(spies.ftlMsgResolver.getMsg).toHaveBeenCalledWith(
      'passkey-authentication-error-unexpected',
      expect.stringContaining('Something went wrong')
    );
    expect(Sentry.captureException as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'passkey-signin error' }),
      { tags: { errno: 'none' } }
    );
  });

  it('surfaces a banner when handleNavigation returns an error', async () => {
    const navError = new Error('OAuth completion failed');
    (handleNavigation as jest.Mock).mockResolvedValue({ error: navError });
    const { args, spies } = buildArgs();

    const { result } = renderHook(() => usePasskeySignIn(args));

    await act(async () => {
      await result.current.onClick();
    });

    expect(result.current.errorBanner).toBeDefined();
    expect(spies.ftlMsgResolver.getMsg).toHaveBeenCalledWith(
      'passkey-authentication-error-unexpected',
      expect.stringContaining('Something went wrong')
    );
    // handleNavigation errors come from an internal helper, not the network,
    // so no PII-sanitisation wrapper is applied.
    expect(Sentry.captureException as jest.Mock).toHaveBeenCalledWith(navError);
  });

  it('shows the "passkey not recognized" banner on errno PASSKEY_NOT_FOUND', async () => {
    const { args, spies } = buildArgs();
    spies.completePasskeyAuthentication.mockRejectedValue(
      Object.assign(new Error('Passkey not found'), {
        errno: AuthUiErrors.PASSKEY_NOT_FOUND.errno,
      })
    );

    const { result } = renderHook(() => usePasskeySignIn(args));

    await act(async () => {
      await result.current.onClick();
    });

    expect(result.current.errorBanner).toBeDefined();
    expect(spies.ftlMsgResolver.getMsg).toHaveBeenCalledWith(
      'passkey-authentication-error-not-found',
      expect.stringContaining('Passkey not recognized')
    );
    // Should NOT be reported to Sentry — it's an expected divergence between
    // server state and authenticator state.
    expect(Sentry.captureException as jest.Mock).not.toHaveBeenCalled();
  });

  describe('Glean metrics', () => {
    it.each([
      ['emailfirst' as const],
      ['login' as const],
      ['login_otp' as const],
      ['alternative_auth' as const],
    ])('fires submit + submit_success for surface=%s', async (surface) => {
      const { args } = buildArgs({ surface });
      const events = gleanForSurface(surface);

      const { result } = renderHook(() => usePasskeySignIn(args));
      await act(async () => {
        await result.current.onClick();
      });

      expect(events.passkeySubmit).toHaveBeenCalledTimes(1);
      expect(events.passkeySubmitSuccess).toHaveBeenCalledTimes(1);
      expect(events.passkeySubmitFrontendError).not.toHaveBeenCalled();
    });

    it('fires submit_frontend_error with categorized reason on WebAuthn error', async () => {
      const { args } = buildArgs({ surface: 'login' });
      (getCredential as jest.Mock).mockRejectedValueOnce(
        new DOMException('cancelled', 'NotAllowedError')
      );

      const { result } = renderHook(() => usePasskeySignIn(args));
      await act(async () => {
        await result.current.onClick();
      });

      expect(
        GleanMetrics.login.passkeySubmitFrontendError
      ).toHaveBeenCalledWith({ event: { reason: 'not_allowed' } });
      expect(GleanMetrics.login.passkeySubmitSuccess).not.toHaveBeenCalled();
    });

    it('fires submit_frontend_error with reason=no_passkey_found on server PASSKEY_NOT_FOUND', async () => {
      const { args, spies } = buildArgs({ surface: 'login' });
      spies.completePasskeyAuthentication.mockRejectedValueOnce({
        errno: AuthUiErrors.PASSKEY_NOT_FOUND.errno,
      });

      const { result } = renderHook(() => usePasskeySignIn(args));
      await act(async () => {
        await result.current.onClick();
      });

      expect(
        GleanMetrics.login.passkeySubmitFrontendError
      ).toHaveBeenCalledWith({ event: { reason: 'no_passkey_found' } });
    });

    it('fires submit_frontend_error with reason=not_supported when WebAuthn L3 missing', async () => {
      (isWebAuthnLevel3Supported as jest.Mock).mockReturnValue(false);
      const { args } = buildArgs({ surface: 'emailfirst' });

      const { result } = renderHook(() => usePasskeySignIn(args));
      await act(async () => {
        await result.current.onClick();
      });

      expect(
        GleanMetrics.emailFirst.passkeySubmitFrontendError
      ).toHaveBeenCalledWith({ event: { reason: 'not_supported' } });
      expect(GleanMetrics.emailFirst.passkeySubmit).not.toHaveBeenCalled();
    });

    it.each([
      ['emailfirst' as const, 'emailfirst_nopassword'],
      ['login' as const, 'signin_nopassword'],
      ['login_otp' as const, 'emailfirst_nopassword'],
      ['alternative_auth' as const, 'signin_nopassword'],
    ])(
      'fires passkey.auth_success with reason=%s on the no-Sync-password branch (surface=%s)',
      async (surface, expectedReason) => {
        const { args } = buildArgs({ surface });
        const { result } = renderHook(() => usePasskeySignIn(args));
        await act(async () => {
          await result.current.onClick();
        });

        expect(GleanMetrics.passkey.authSuccess).toHaveBeenCalledWith({
          event: { reason: expectedReason },
        });
      }
    );

    it('does NOT fire passkey.auth_success when Sync requires a password (deferred to destination page)', async () => {
      const { args, spies } = buildArgs({
        surface: 'emailfirst',
        integration: {
          isSync: () => true,
          isFirefoxNonSync: () => false,
          getService: () => 'sync',
          type: IntegrationType.OAuthNative,
          data: {},
        } as unknown as PasskeySignInIntegration,
      });
      spies.completePasskeyAuthentication.mockResolvedValue({
        uid: UID,
        sessionToken: SESSION_TOKEN,
        verified: true,
        requiresPasswordForSync: true,
        hasPassword: true,
      });

      const { result } = renderHook(() => usePasskeySignIn(args));
      await act(async () => {
        await result.current.onClick();
      });

      expect(spies.navigateWithQuery).toHaveBeenCalledWith(
        '/signin_passkey_fallback',
        { state: { passkeySurface: 'emailfirst' } }
      );
      expect(GleanMetrics.passkey.authSuccess).not.toHaveBeenCalled();
    });

    it('does NOT fire passkey.auth_success when handleNavigation returns an error', async () => {
      (handleNavigation as jest.Mock).mockResolvedValueOnce({
        error: { errno: 999 },
      });
      const { args } = buildArgs({ surface: 'login' });

      const { result } = renderHook(() => usePasskeySignIn(args));
      await act(async () => {
        await result.current.onClick();
      });

      expect(GleanMetrics.passkey.authSuccess).not.toHaveBeenCalled();
    });
  });

  it('ignores additional clicks while a ceremony is in flight', async () => {
    type AccountResponse = {
      emails: Array<{ email: string; isPrimary: boolean; verified: boolean }>;
    };
    let resolveAccount: (v: AccountResponse) => void;
    const accountPromise = new Promise<AccountResponse>((resolve) => {
      resolveAccount = resolve;
    });
    const { args, spies } = buildArgs();
    spies.account.mockReturnValue(accountPromise);

    const { result } = renderHook(() => usePasskeySignIn(args));

    await act(async () => {
      result.current.onClick();
      result.current.onClick();
    });

    expect(spies.beginPasskeyAuthentication).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolveAccount!({
        emails: [{ email: EMAIL, isPrimary: true, verified: true }],
      });
      await accountPromise;
    });
    // After the in-flight ceremony resolves, downstream side effects must
    // each fire exactly once — proving the second click was suppressed end
    // to end, not just at the entry point.
    expect(storeAccountData).toHaveBeenCalledTimes(1);
    expect(handleNavigation).toHaveBeenCalledTimes(1);
  });

  describe('AAL2 RP TOTP status', () => {
    const buildAAL2Args = (
      totp: { exists: boolean; verified: boolean } | undefined,
      overrides: Record<string, unknown> = {}
    ) => {
      const integration = {
        isSync: () => false,
        isFirefoxNonSync: () => false,
        getService: () => undefined,
        getClientId: () => 'service-id',
        type: IntegrationType.OAuthWeb,
        data: {},
        wantsTwoStepAuthentication: () => true,
      } as unknown as PasskeySignInIntegration;
      const { args, spies } = buildArgs({ integration, ...overrides });
      (args.authClient.account as jest.Mock).mockResolvedValue({
        emails: [{ email: EMAIL, isPrimary: true, verified: true }],
        ...(totp !== undefined && { totp }),
      });
      return { args, spies };
    };

    it('passes accountHasTotp=false when the account has no TOTP enrolled', async () => {
      const { args } = buildAAL2Args({ exists: false, verified: false });

      const { result } = renderHook(() => usePasskeySignIn(args));
      await act(async () => {
        await result.current.onClick();
      });

      expect(handleNavigation).toHaveBeenCalledWith(
        expect.objectContaining({
          isPasskeySession: true,
          accountHasTotp: false,
        })
      );
    });

    it('passes accountHasTotp=true when the account has TOTP enrolled', async () => {
      const { args } = buildAAL2Args({ exists: true, verified: true });

      const { result } = renderHook(() => usePasskeySignIn(args));
      await act(async () => {
        await result.current.onClick();
      });

      expect(handleNavigation).toHaveBeenCalledWith(
        expect.objectContaining({
          isPasskeySession: true,
          accountHasTotp: true,
        })
      );
    });

    it('passes accountHasTotp=false when TOTP record exists but is unverified', async () => {
      // Must read `verified`, not `exists`, to gate on completed enrolment.
      const { args } = buildAAL2Args({ exists: true, verified: false });

      const { result } = renderHook(() => usePasskeySignIn(args));
      await act(async () => {
        await result.current.onClick();
      });

      expect(handleNavigation).toHaveBeenCalledWith(
        expect.objectContaining({
          isPasskeySession: true,
          accountHasTotp: false,
        })
      );
    });

    it('treats a missing totp field as not-enrolled', async () => {
      const { args } = buildAAL2Args(undefined);

      const { result } = renderHook(() => usePasskeySignIn(args));
      await act(async () => {
        await result.current.onClick();
      });

      expect(handleNavigation).toHaveBeenCalledWith(
        expect.objectContaining({
          isPasskeySession: true,
          accountHasTotp: false,
        })
      );
    });

    it('still passes accountHasTotp even when the RP does not require AAL2', async () => {
      // utils.ts gates on wantsTwoStepAuthentication() before reading it.
      const { args } = buildAAL2Args(
        { exists: true, verified: true },
        {
          integration: {
            isSync: () => false,
            isFirefoxNonSync: () => false,
            getService: () => undefined,
            getClientId: () => 'service-id',
            type: IntegrationType.OAuthWeb,
            data: {},
            wantsTwoStepAuthentication: () => false,
          } as unknown as PasskeySignInIntegration,
        }
      );

      const { result } = renderHook(() => usePasskeySignIn(args));
      await act(async () => {
        await result.current.onClick();
      });

      expect(handleNavigation).toHaveBeenCalledWith(
        expect.objectContaining({
          isPasskeySession: true,
          accountHasTotp: true,
        })
      );
    });
  });
});
