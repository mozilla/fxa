/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, renderHook, waitFor } from '@testing-library/react';
import * as Sentry from '@sentry/browser';
import { FtlMsgResolver } from 'fxa-react/lib/utils';
import { MemoryRouter } from 'react-router';
import React from 'react';
import { usePasskeySignIn, type PasskeySignInAuthClient } from '.';
import { type PasskeySignInIntegration } from '../../passkeys/signin-flow';
import { getCredential, isWebAuthnSupported } from '../../passkeys/webauthn';
import { storeAccountData } from '../../storage-utils';
import { AuthUiErrors } from '../../auth-errors/auth-errors';
import GleanMetrics from '../../glean';
import { queryParamsToMetricsContext } from '../../metrics';
import type { QueryParams } from '../../..';
import { AppContext, IntegrationType } from '../../../models';
import type { AppContextValue } from '../../../models';
import { mockAppContext } from '../../../models/mocks';
import { getDefault } from '../../config';
import { SensitiveDataClient } from '../../sensitive-data-client';
import {
  ensureCanLinkAcountOrRedirect,
  handleNavigation,
} from '../../../pages/Signin/utils';
import {
  unwrapPasskeyKb,
  type UnwrapPasskeyKbResult,
} from '../../passkeys/wrap/consumption';

jest.mock('../../passkeys/wrap/consumption', () => ({
  __esModule: true,
  unwrapPasskeyKb: jest.fn(),
}));

jest.mock('../../passkeys/webauthn', () => ({
  __esModule: true,
  ...jest.requireActual('../../passkeys/webauthn'),
  isWebAuthnSupported: jest.fn(),
  getCredential: jest.fn(),
}));

jest.mock('../../../pages/Signin/utils', () => ({
  __esModule: true,
  ensureCanLinkAcountOrRedirect: jest.fn(),
  handleNavigation: jest.fn(),
}));

jest.mock('@sentry/browser', () => ({
  __esModule: true,
  captureException: jest.fn(),
}));

jest.mock('../../storage-utils', () => ({
  __esModule: true,
  storeAccountData: jest.fn(),
}));

jest.mock('../../glean', () => ({
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
      buttonView: jest.fn(),
      authSuccess: jest.fn(),
      getHelpLinkClick: jest.fn(),
      signinPrfSupport: jest.fn(),
      signinRetryWithoutPrfRequest: jest.fn(),
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
const MOCK_FLOW_QUERY_PARAMS = {
  flowId: 'f'.repeat(64),
  flowBeginTime: '1700000000000',
  deviceId: 'd'.repeat(32),
} as unknown as QueryParams;

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
    hasPassword: true,
  });
  const account = jest.fn().mockResolvedValue({
    emails: [{ email: EMAIL, isPrimary: true, verified: true }],
    totp: { exists: false, verified: false },
  });
  const sessionResendVerifyCode = jest.fn();
  const getPasskeyWrap = jest.fn();

  const authClient = {
    beginPasskeyAuthentication,
    completePasskeyAuthentication,
    account,
    sessionResendVerifyCode,
    getPasskeyWrap,
  } as jest.Mocked<PasskeySignInAuthClient>;
  const integration = {
    isSync: () => false,
    isFirefoxNonSync: () => false,
    requiresPasswordForLogin: () => false,
    getService: () => undefined,
    getClientId: () => 'service-id',
    isFirefoxMobileClient: () => false,
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

let sensitiveDataClient: SensitiveDataClient;
let passkeyPasswordlessSyncEnabled = false;

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    AppContext.Provider,
    {
      value: mockAppContext({
        sensitiveDataClient,
        config: {
          ...getDefault(),
          featureFlags: { passkeyPasswordlessSyncEnabled },
        },
      } as AppContextValue),
    },
    React.createElement(MemoryRouter, null, children)
  );

beforeEach(() => {
  jest.clearAllMocks();
  sensitiveDataClient = new SensitiveDataClient();
  passkeyPasswordlessSyncEnabled = false;
  (isWebAuthnSupported as jest.Mock).mockReturnValue(true);
  (getCredential as jest.Mock).mockResolvedValue(MOCK_CREDENTIAL);
  (ensureCanLinkAcountOrRedirect as jest.Mock).mockResolvedValue(true);
  (handleNavigation as jest.Mock).mockResolvedValue({ error: undefined });
  (unwrapPasskeyKb as jest.Mock).mockResolvedValue({
    ok: false,
    reason: 'no_wrap',
  });
});

describe('usePasskeySignIn', () => {
  it('shows a banner and skips the ceremony when WebAuthn is unsupported', async () => {
    (isWebAuthnSupported as jest.Mock).mockReturnValue(false);
    const { args, spies } = buildArgs();

    const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });

    await act(async () => {
      result.current.onClick();
    });

    expect(spies.beginPasskeyAuthentication).not.toHaveBeenCalled();
    expect(result.current.banner).toBeDefined();
    expect(spies.ftlMsgResolver.getMsg).toHaveBeenCalledWith(
      'passkey-authentication-error-not-supported-v2',
      'Your browser or device doesn’t support passkeys.'
    );
  });

  it('completes the OAuth flow via handleNavigation when no Sync password is required', async () => {
    const { args, spies } = buildArgs();

    const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });

    await act(async () => {
      await result.current.onClick();
    });

    expect(spies.beginPasskeyAuthentication).toHaveBeenCalledTimes(1);
    expect(spies.completePasskeyAuthentication).toHaveBeenCalledWith(
      MOCK_CREDENTIAL,
      CHALLENGE,
      {
        service: 'service-id',
        keysRequired: false,
        metricsContext: {},
      }
    );
    expect(spies.account).toHaveBeenCalledWith(SESSION_TOKEN);
    expect(handleNavigation).toHaveBeenCalledWith({
      navigate: expect.any(Function),
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
      authClient: args.authClient,
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

  it('routes non-OAuth Web integrations through handleNavigation', async () => {
    // Soft-navigate to /settings happens inside handleNavigation (same path
    // as password sign-in). hardNavigate would cause a cached-signin flash.
    const { args, spies } = buildArgs({
      integration: {
        isSync: () => false,
        isFirefoxNonSync: () => false,
        requiresPasswordForLogin: () => false,
        getService: () => undefined,
        getClientId: () => 'service-id',
        isFirefoxMobileClient: () => false,
        type: IntegrationType.Web,
        data: {},
      } as unknown as PasskeySignInIntegration,
    });

    const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });

    await act(async () => {
      await result.current.onClick();
    });

    expect(spies.completePasskeyAuthentication).toHaveBeenCalledWith(
      MOCK_CREDENTIAL,
      CHALLENGE,
      { keysRequired: false, metricsContext: {} }
    );
    expect(storeAccountData).toHaveBeenCalled();
    expect(handleNavigation).toHaveBeenCalledWith({
      navigate: expect.any(Function),
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
      authClient: args.authClient,
    });
  });

  it('runs the Sync merge gate and aborts when the user cancels', async () => {
    (ensureCanLinkAcountOrRedirect as jest.Mock).mockResolvedValue(false);
    const { args, spies } = buildArgs({
      integration: {
        isSync: () => true,
        isFirefoxNonSync: () => false,
        requiresPasswordForLogin: () => false,
        getService: () => 'sync',
        type: IntegrationType.OAuthNative,
        data: {},
      } as unknown as PasskeySignInIntegration,
    });

    const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });

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
          requiresPasswordForLogin: () => true,
          getService: () => 'sync',
          type: IntegrationType.OAuthNative,
          data: {},
        } as unknown as PasskeySignInIntegration,
      });
      spies.completePasskeyAuthentication.mockResolvedValue({
        uid: UID,
        sessionToken: SESSION_TOKEN,
        verified: true,
        hasPassword,
      });

      const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });

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

  it('routes a non-Sync sign-in to set_password when requiresPasswordForLogin is true', async () => {
    const { args, spies } = buildArgs({
      integration: {
        isSync: () => false,
        isFirefoxNonSync: () => true,
        requiresPasswordForLogin: () => true,
        getService: () => 'vpn',
        getClientId: () => 'service-id',
        isFirefoxMobileClient: () => false,
        type: IntegrationType.OAuthNative,
        data: {},
      } as unknown as PasskeySignInIntegration,
    });
    spies.completePasskeyAuthentication.mockResolvedValue({
      uid: UID,
      sessionToken: SESSION_TOKEN,
      verified: true,
      hasPassword: false,
    });

    const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });
    await act(async () => {
      await result.current.onClick();
    });
    expect(spies.completePasskeyAuthentication).toHaveBeenCalledWith(
      MOCK_CREDENTIAL,
      CHALLENGE,
      expect.objectContaining({ keysRequired: true })
    );
    expect(spies.navigateWithQuery).toHaveBeenCalledWith(
      '/post_verify/set_password',
      {
        state: {
          passwordCreationReason: 'passkey',
          passkeySurface: 'emailfirst',
        },
      }
    );
    expect(handleNavigation).not.toHaveBeenCalled();
  });

  it('forwards supportsKeysOptionalLogin to integration.requiresPasswordForLogin', async () => {
    const requiresPasswordForLogin = jest.fn().mockReturnValue(false);
    const { args } = buildArgs({
      integration: {
        isSync: () => false,
        isFirefoxNonSync: () => true,
        requiresPasswordForLogin,
        getService: () => 'vpn',
        getClientId: () => 'service-id',
        isFirefoxMobileClient: () => false,
        type: IntegrationType.OAuthNative,
        data: {},
      } as unknown as PasskeySignInIntegration,
      supportsKeysOptionalLogin: true,
    });

    const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });
    await act(async () => {
      await result.current.onClick();
    });

    expect(requiresPasswordForLogin).toHaveBeenCalledWith(true);
  });

  it('skips navigation on Firefox mobile so Firefox finishes sign-in via WebChannel', async () => {
    const { args } = buildArgs({
      integration: {
        isSync: () => false,
        isFirefoxNonSync: () => true,
        // VPN without keys: exercises the mobile navigation-skip path, not the password detour.
        requiresPasswordForLogin: () => false,
        getService: () => 'vpn',
        getClientId: () => 'service-id',
        isFirefoxMobileClient: () => true,
        type: IntegrationType.OAuthNative,
        data: {},
      } as unknown as PasskeySignInIntegration,
    });

    const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });
    await act(async () => {
      await result.current.onClick();
    });

    expect(handleNavigation).toHaveBeenCalledWith(
      expect.objectContaining({ performNavigation: false })
    );
  });

  it.each([
    [
      'emailfirst' as const,
      true,
      '/signin_passkey_fallback',
      { state: { passkeySurface: 'emailfirst' } },
    ],
    [
      'login' as const,
      true,
      '/signin_passkey_fallback',
      { state: { passkeySurface: 'signin' } },
    ],
    // No-password surfaces (otplogin, alternative_auth) route to set-password
    // (createdpassword); they never reach the existing-password fallback.
    [
      'login_otp' as const,
      false,
      '/post_verify/set_password',
      {
        state: {
          passwordCreationReason: 'passkey',
          passkeySurface: 'otplogin',
        },
      },
    ],
    [
      'alternative_auth' as const,
      false,
      '/post_verify/set_password',
      {
        state: {
          passwordCreationReason: 'passkey',
          passkeySurface: 'alternative_auth',
        },
      },
    ],
  ])(
    'threads the passkey surface for %s into the %s nav state',
    async (surface, hasPassword, expectedPath, expectedOptions) => {
      const { args, spies } = buildArgs({
        surface,
        integration: {
          isSync: () => true,
          isFirefoxNonSync: () => false,
          requiresPasswordForLogin: () => true,
          getService: () => 'sync',
          type: IntegrationType.OAuthNative,
          data: {},
        } as unknown as PasskeySignInIntegration,
      });
      spies.completePasskeyAuthentication.mockResolvedValue({
        uid: UID,
        sessionToken: SESSION_TOKEN,
        verified: true,
        hasPassword,
      });

      const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });
      await act(async () => {
        await result.current.onClick();
      });

      expect(spies.navigateWithQuery).toHaveBeenCalledWith(
        expectedPath,
        expectedOptions
      );
    }
  );

  it('treats beginPasskeyAuthentication rejection as a server error', async () => {
    const { args, spies } = buildArgs();
    spies.beginPasskeyAuthentication.mockRejectedValue(
      new Error('network down')
    );

    const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });

    await act(async () => {
      await result.current.onClick();
    });

    expect(result.current.banner).toBeDefined();
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

    const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });

    await act(async () => {
      await result.current.onClick();
    });

    expect(result.current.banner).toBeDefined();
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

    const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });

    await act(async () => {
      await result.current.onClick();
    });

    expect(result.current.banner).toBeDefined();
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

    const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });

    await act(async () => {
      await result.current.onClick();
    });

    expect(result.current.banner).toBeDefined();
    expect(spies.ftlMsgResolver.getMsg).toHaveBeenCalledWith(
      'passkey-authentication-error-unexpected',
      expect.stringContaining('Something went wrong')
    );
    expect(Sentry.captureException as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'passkey-signin nav error' }),
      { tags: { errno: 'none' } }
    );
  });

  describe('isNavigating (page-level loading state)', () => {
    it('starts false before any sign-in attempt', () => {
      const { args } = buildArgs();
      const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });
      expect(result.current.isNavigating).toBe(false);
    });

    it('is raised and left set on the no-password committed-success path', async () => {
      const { args } = buildArgs();
      const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });
      await act(async () => {
        await result.current.onClick();
      });
      expect(result.current.isNavigating).toBe(true);
    });

    it('is not raised when handleNavigation returns an error, so the form stays rendered', async () => {
      (handleNavigation as jest.Mock).mockResolvedValue({
        error: new Error('OAuth completion failed'),
      });
      const { args } = buildArgs();
      const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });
      await act(async () => {
        await result.current.onClick();
      });
      expect(result.current.isNavigating).toBe(false);
      expect(result.current.banner).toBeDefined();
    });

    it('is raised before routing to the password step when keys are required', async () => {
      const { args, spies } = buildArgs({
        integration: {
          isSync: () => true,
          isFirefoxNonSync: () => false,
          requiresPasswordForLogin: () => true,
          getService: () => 'sync',
          type: IntegrationType.OAuthNative,
          data: {},
        } as unknown as PasskeySignInIntegration,
      });
      const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });
      await act(async () => {
        await result.current.onClick();
      });
      expect(spies.navigateWithQuery).toHaveBeenCalledWith(
        '/signin_passkey_fallback',
        { state: { passkeySurface: 'emailfirst' } }
      );
      expect(result.current.isNavigating).toBe(true);
    });

    it('stays raised on the Firefox mobile WebChannel handoff, where no navigation is performed', async () => {
      const { args } = buildArgs({
        integration: {
          isSync: () => false,
          isFirefoxNonSync: () => true,
          requiresPasswordForLogin: () => false,
          getService: () => 'vpn',
          getClientId: () => 'service-id',
          isFirefoxMobileClient: () => true,
          type: IntegrationType.OAuthNative,
          data: {},
        } as unknown as PasskeySignInIntegration,
      });
      const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });
      await act(async () => {
        await result.current.onClick();
      });
      expect(result.current.isNavigating).toBe(true);
    });

    it('is not raised when the ceremony is cancelled', async () => {
      (getCredential as jest.Mock).mockRejectedValue(
        new DOMException('cancelled', 'NotAllowedError')
      );
      const { args } = buildArgs();
      const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });
      await act(async () => {
        await result.current.onClick();
      });
      expect(result.current.isNavigating).toBe(false);
    });
  });

  it('shows the "passkey not recognized" banner on errno PASSKEY_NOT_FOUND', async () => {
    const { args, spies } = buildArgs();
    spies.completePasskeyAuthentication.mockRejectedValue(
      Object.assign(new Error('Passkey not found'), {
        errno: AuthUiErrors.PASSKEY_NOT_FOUND.errno,
      })
    );

    const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });

    await act(async () => {
      await result.current.onClick();
    });

    expect(result.current.banner).toBeDefined();
    expect(spies.ftlMsgResolver.getMsg).toHaveBeenCalledWith(
      'passkey-authentication-error-not-found',
      expect.stringContaining('Passkey not recognized')
    );
    // Should NOT be reported to Sentry — it's an expected divergence between
    // server state and authenticator state.
    expect(Sentry.captureException as jest.Mock).not.toHaveBeenCalled();
  });

  describe('metricsContext flow identity', () => {
    it('builds metricsContext from flowQueryParams, not the live location.search', async () => {
      // location.search carries a different flow; it must be ignored so the
      // server login.complete joins the client passkey metrics on flow_id.
      const { args, spies } = buildArgs({
        queryParams:
          '?flowId=stale-url-flow&flowBeginTime=1&deviceId=stale-url-device',
        flowQueryParams: MOCK_FLOW_QUERY_PARAMS,
      });

      const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });
      await act(async () => {
        await result.current.onClick();
      });

      expect(spies.completePasskeyAuthentication).toHaveBeenCalledWith(
        MOCK_CREDENTIAL,
        CHALLENGE,
        {
          service: 'service-id',
          keysRequired: false,
          metricsContext: queryParamsToMetricsContext(MOCK_FLOW_QUERY_PARAMS),
        }
      );
    });
  });

  describe('Glean metrics', () => {
    it.each([
      ['emailfirst' as const, 'emailfirst'],
      ['login' as const, 'signin'],
      ['login_otp' as const, 'otplogin'],
      ['alternative_auth' as const, 'alternative_auth'],
    ])(
      'fires passkey.button_view with reason=%s when the button is visible (surface=%s)',
      async (surface, expectedReason) => {
        const { args } = buildArgs({ surface, isButtonVisible: true });
        renderHook(() => usePasskeySignIn(args), { wrapper });

        expect(GleanMetrics.passkey.buttonView).toHaveBeenCalledTimes(1);
        expect(GleanMetrics.passkey.buttonView).toHaveBeenCalledWith({
          event: { reason: expectedReason },
        });
      }
    );

    it('does NOT fire passkey.button_view when the button is hidden', async () => {
      const { args } = buildArgs({
        surface: 'login',
        isButtonVisible: false,
      });
      renderHook(() => usePasskeySignIn(args), { wrapper });

      expect(GleanMetrics.passkey.buttonView).not.toHaveBeenCalled();
    });

    it.each([
      ['emailfirst' as const],
      ['login' as const],
      ['login_otp' as const],
      ['alternative_auth' as const],
    ])('fires submit + submit_success for surface=%s', async (surface) => {
      const { args } = buildArgs({ surface });
      const events = gleanForSurface(surface);

      const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });
      await act(async () => {
        await result.current.onClick();
      });

      expect(events.passkeySubmit).toHaveBeenCalledTimes(1);
      expect(events.passkeySubmitSuccess).toHaveBeenCalledTimes(1);
      expect(events.passkeySubmitFrontendError).not.toHaveBeenCalled();
    });

    it('fires submit_frontend_error with reason=no_passkey_found on server PASSKEY_NOT_FOUND', async () => {
      const { args, spies } = buildArgs({ surface: 'login' });
      spies.completePasskeyAuthentication.mockRejectedValueOnce({
        errno: AuthUiErrors.PASSKEY_NOT_FOUND.errno,
      });

      const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });
      await act(async () => {
        await result.current.onClick();
      });

      expect(
        GleanMetrics.login.passkeySubmitFrontendError
      ).toHaveBeenCalledWith({ event: { reason: 'no_passkey_found' } });
    });

    it('fires submit_frontend_error with reason=not_supported when WebAuthn L3 missing', async () => {
      (isWebAuthnSupported as jest.Mock).mockReturnValue(false);
      const { args } = buildArgs({ surface: 'emailfirst' });

      const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });
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
      ['login_otp' as const, 'otplogin_nopassword'],
      ['alternative_auth' as const, 'alternative_auth_nopassword'],
    ])(
      'fires passkey.auth_success with reason=%s on the no-Sync-password branch (surface=%s)',
      async (surface, expectedReason) => {
        const { args } = buildArgs({ surface });
        const { result } = renderHook(() => usePasskeySignIn(args), {
          wrapper,
        });
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
          requiresPasswordForLogin: () => true,
          getService: () => 'sync',
          type: IntegrationType.OAuthNative,
          data: {},
        } as unknown as PasskeySignInIntegration,
      });
      spies.completePasskeyAuthentication.mockResolvedValue({
        uid: UID,
        sessionToken: SESSION_TOKEN,
        verified: true,
        hasPassword: true,
      });

      const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });
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

      const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });
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

    const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });

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
});

const PRF_OUT = new Uint8Array(32).fill(3);

const syncIntegration = () =>
  ({
    isSync: () => true,
    isFirefoxNonSync: () => false,
    requiresPasswordForLogin: () => true,
    getService: () => 'sync',
    getClientId: () => undefined,
    isFirefoxMobileClient: () => false,
    type: IntegrationType.OAuthNative,
    data: {},
    wantsTwoStepAuthentication: () => false,
  }) as unknown as PasskeySignInIntegration;

const buildSyncArgs = (integration = syncIntegration()) => {
  const built = buildArgs({ integration });
  built.spies.beginPasskeyAuthentication.mockResolvedValue({
    challenge: CHALLENGE,
    extensions: { prf: { eval: { first: 'c2FsdA' } } },
  });
  built.spies.completePasskeyAuthentication.mockResolvedValue({
    uid: UID,
    sessionToken: SESSION_TOKEN,
    verified: true,
    hasPassword: true,
    mfaToken: 'mfa-token',
  });
  (getCredential as jest.Mock).mockResolvedValue({
    ...MOCK_CREDENTIAL,
    clientExtensionResults: {
      prf: { results: { first: PRF_OUT.slice().buffer } },
    },
  });
  return built;
};

const renderSyncHook = ({
  integration = syncIntegration(),
  flagOn = true,
}: { integration?: PasskeySignInIntegration; flagOn?: boolean } = {}) => {
  passkeyPasswordlessSyncEnabled = flagOn;
  const { args, spies } = buildSyncArgs(integration);
  const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });
  return { args, result, spies };
};

describe('usePasskeySignIn passwordless Sync opt-in material', () => {
  it('requests the passkey scope and holds the PRF output with the proof', async () => {
    const { result, spies } = renderSyncHook();

    await act(() => result.current.onClick());

    expect(spies.beginPasskeyAuthentication).toHaveBeenCalledWith({
      keysRequired: true,
      scope: 'passkey',
    });
    expect(sensitiveDataClient.PasskeyWrapData).toEqual({
      uid: UID,
      credentialId: MOCK_CREDENTIAL.id,
      mfaToken: 'mfa-token',
      prfOut: PRF_OUT,
    });
    // The PRF output still never reaches the server.
    const [sentCredential] = spies.completePasskeyAuthentication.mock.calls[0];
    expect(sentCredential.clientExtensionResults).toEqual({});
  });

  it('zeroes and clears material left by an earlier ceremony before starting a new one', async () => {
    const stale = {
      uid: 'stale',
      credentialId: 'stale',
      mfaToken: 'stale',
      prfOut: new Uint8Array(32).fill(5),
      kB: new Uint8Array(32).fill(6),
    };
    sensitiveDataClient.PasskeyWrapData = stale;
    const { result } = renderSyncHook({ flagOn: false });

    await act(() => result.current.onClick());

    expect(stale.prfOut).toEqual(new Uint8Array(32));
    expect(stale.kB).toEqual(new Uint8Array(32));
    expect(sensitiveDataClient.PasskeyWrapData).toBeUndefined();
  });

  it('requests no scope and holds nothing for a non-Sync Firefox service that requires keys', async () => {
    const integration = syncIntegration();
    integration.isSync = () => false;
    integration.isFirefoxNonSync = () => true;
    integration.getService = () => 'vpn';
    const { result, spies } = renderSyncHook({ integration });

    await act(() => result.current.onClick());

    expect(spies.beginPasskeyAuthentication).toHaveBeenCalledWith({
      keysRequired: true,
    });
    expect(unwrapPasskeyKb).not.toHaveBeenCalled();
    expect(sensitiveDataClient.PasskeyWrapData).toBeUndefined();
  });

  it('skips the wrap path for a non-OAuth Sync integration', async () => {
    const integration = syncIntegration();
    (integration as { type: IntegrationType }).type =
      IntegrationType.SyncDesktopV3;
    const { result, spies } = renderSyncHook({ integration });

    await act(() => result.current.onClick());

    expect(spies.beginPasskeyAuthentication).toHaveBeenCalledWith({
      keysRequired: true,
    });
    expect(unwrapPasskeyKb).not.toHaveBeenCalled();
    expect(sensitiveDataClient.PasskeyWrapData).toBeUndefined();
  });

  it('requests no scope and holds nothing when the flag is off', async () => {
    const { result, spies } = renderSyncHook({ flagOn: false });

    await act(() => result.current.onClick());

    expect(spies.beginPasskeyAuthentication).toHaveBeenCalledWith({
      keysRequired: true,
    });
    expect(unwrapPasskeyKb).not.toHaveBeenCalled();
    expect(spies.navigateWithQuery).toHaveBeenCalledWith(
      '/signin_passkey_fallback',
      { state: { passkeySurface: 'emailfirst' } }
    );
    expect(sensitiveDataClient.PasskeyWrapData).toBeUndefined();
  });

  it('runs wrap consumption on a mobile client but never stashes opt-in material, since the opt-in page is desktop-only', async () => {
    const integration = syncIntegration();
    (
      integration as { isFirefoxMobileClient: () => boolean }
    ).isFirefoxMobileClient = () => true;
    const { result, spies } = renderSyncHook({ integration });

    await act(() => result.current.onClick());

    expect(spies.beginPasskeyAuthentication).toHaveBeenCalledWith({
      keysRequired: true,
      scope: 'passkey',
    });
    expect(unwrapPasskeyKb).toHaveBeenCalled();
    expect(spies.navigateWithQuery).toHaveBeenCalledWith(
      '/signin_passkey_fallback',
      {
        state: {
          passkeySurface: 'emailfirst',
        },
      }
    );
    expect(sensitiveDataClient.PasskeyWrapData).toBeUndefined();
  });

  it('holds nothing when the account still has to create a password', async () => {
    const { result, spies } = renderSyncHook();
    spies.completePasskeyAuthentication.mockResolvedValue({
      uid: UID,
      sessionToken: SESSION_TOKEN,
      verified: true,
      hasPassword: false,
      mfaToken: 'mfa-token',
    });

    await act(() => result.current.onClick());

    expect(unwrapPasskeyKb).not.toHaveBeenCalled();
    expect(sensitiveDataClient.PasskeyWrapData).toBeUndefined();
  });

  it('holds nothing when the authenticator returned no PRF output', async () => {
    (unwrapPasskeyKb as jest.Mock).mockResolvedValue({
      ok: false,
      reason: 'no_prf',
    });
    const { args, result, spies } = renderSyncHook();
    (getCredential as jest.Mock).mockResolvedValue(MOCK_CREDENTIAL);

    await act(() => result.current.onClick());

    expect(unwrapPasskeyKb).toHaveBeenCalledWith(
      args.authClient,
      expect.objectContaining({ prfOut: undefined })
    );
    expect(spies.navigateWithQuery).toHaveBeenCalledWith(
      '/signin_passkey_fallback',
      {
        state: {
          passkeySurface: 'emailfirst',
        },
      }
    );
    expect(sensitiveDataClient.PasskeyWrapData).toBeUndefined();
  });
});

describe('usePasskeySignIn passwordless Sync consumption', () => {
  it('completes the OAuth flow with kB and no password page when the wrap opens', async () => {
    // The hook zeroes the array it passed in, so read it at call time.
    let prfOutAtCall: Uint8Array | undefined;
    (unwrapPasskeyKb as jest.Mock).mockImplementation(
      async (_client, { prfOut }) => {
        prfOutAtCall = prfOut && new Uint8Array(prfOut);
        return { ok: true, kB: new Uint8Array(32).fill(0xab) };
      }
    );
    const { args, result, spies } = renderSyncHook();

    await act(() => result.current.onClick());

    expect(unwrapPasskeyKb).toHaveBeenCalledWith(args.authClient, {
      mfaToken: 'mfa-token',
      credentialId: MOCK_CREDENTIAL.id,
      prfOut: expect.any(Uint8Array),
    });
    expect(prfOutAtCall).toEqual(PRF_OUT);
    expect(handleNavigation).toHaveBeenCalledWith(
      expect.objectContaining({ kB: 'ab'.repeat(32) })
    );
    expect(spies.navigateWithQuery).not.toHaveBeenCalled();
    expect(GleanMetrics.passkey.authSuccess).toHaveBeenCalledWith({
      event: { reason: 'emailfirst_nopassword' },
    });
    expect(sensitiveDataClient.PasskeyWrapData).toBeUndefined();
  });
  it('zeroes the extracted PRF output once the ceremony ends', async () => {
    const { result } = renderSyncHook();

    await act(() => result.current.onClick());

    const [, { prfOut }] = (unwrapPasskeyKb as jest.Mock).mock.calls[0];
    expect(prfOut).toEqual(new Uint8Array(32));
  });

  it.each([
    'no_prf',
    'passkey_not_found',
    'proof_invalid',
    'decrypt_failed',
    'fetch_failed',
  ] as const)(
    'falls back to the password page on %s without stashing opt-in material',
    async (reason) => {
      (unwrapPasskeyKb as jest.Mock).mockResolvedValue({ ok: false, reason });
      const { result, spies } = renderSyncHook();

      await act(() => result.current.onClick());

      expect(spies.navigateWithQuery).toHaveBeenCalledWith(
        '/signin_passkey_fallback',
        {
          state: {
            passkeySurface: 'emailfirst',
          },
        }
      );
      expect(sensitiveDataClient.PasskeyWrapData).toBeUndefined();
      expect(handleNavigation).not.toHaveBeenCalled();
    }
  );

  it('falls back to the password page as fetch_failed when the wrap module fails to load', async () => {
    // Exercises the try/catch around the dynamic import; unwrapPasskeyKb
    // itself never rejects, so a rejection here stands in for a failed chunk load.
    (unwrapPasskeyKb as jest.Mock).mockRejectedValue(new Error('chunk'));
    const { result, spies } = renderSyncHook();

    await act(() => result.current.onClick());

    expect(spies.navigateWithQuery).toHaveBeenCalledWith(
      '/signin_passkey_fallback',
      {
        state: {
          passkeySurface: 'emailfirst',
        },
      }
    );
    expect(sensitiveDataClient.PasskeyWrapData).toBeUndefined();
    expect(handleNavigation).not.toHaveBeenCalled();
  });

  it('neither completes sign-in nor navigates when the page is left while the wrap fetch is pending', async () => {
    let settle!: (value: UnwrapPasskeyKbResult) => void;
    (unwrapPasskeyKb as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        settle = resolve;
      })
    );
    passkeyPasswordlessSyncEnabled = true;
    const { args, spies } = buildSyncArgs();
    const { result, unmount } = renderHook(() => usePasskeySignIn(args), {
      wrapper,
    });
    const kB = new Uint8Array(32).fill(7);

    let click!: Promise<void>;
    act(() => {
      click = result.current.onClick();
    });
    await waitFor(() => expect(unwrapPasskeyKb).toHaveBeenCalled());
    unmount();
    settle({ ok: true, kB });
    await act(() => click);

    expect(handleNavigation).not.toHaveBeenCalled();
    expect(spies.navigateWithQuery).not.toHaveBeenCalled();
    expect(kB).toEqual(new Uint8Array(32));
  });

  it('holds nothing when the page is left while the wrap fetch is pending', async () => {
    let settle!: (value: UnwrapPasskeyKbResult) => void;
    (unwrapPasskeyKb as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        settle = resolve;
      })
    );
    passkeyPasswordlessSyncEnabled = true;
    const { args } = buildSyncArgs();
    const { result, unmount } = renderHook(() => usePasskeySignIn(args), {
      wrapper,
    });

    let click!: Promise<void>;
    act(() => {
      click = result.current.onClick();
    });
    await waitFor(() => expect(unwrapPasskeyKb).toHaveBeenCalled());
    unmount();
    settle({ ok: false, reason: 'no_wrap' });
    await act(() => click);

    expect(sensitiveDataClient.PasskeyWrapData).toBeUndefined();
  });

  it.each(['no_wrap', 'stale'] as const)(
    'stashes opt-in material and falls back when the stored wrap is %s',
    async (reason) => {
      (unwrapPasskeyKb as jest.Mock).mockResolvedValue({ ok: false, reason });
      const { result, spies } = renderSyncHook();

      await act(() => result.current.onClick());

      expect(sensitiveDataClient.PasskeyWrapData).toEqual(
        expect.objectContaining({
          uid: UID,
          credentialId: MOCK_CREDENTIAL.id,
          mfaToken: 'mfa-token',
          prfOut: PRF_OUT,
        })
      );
      expect(spies.navigateWithQuery).toHaveBeenCalledWith(
        '/signin_passkey_fallback',
        {
          state: {
            passkeySurface: 'emailfirst',
          },
        }
      );
      expect(handleNavigation).not.toHaveBeenCalled();
    }
  );
});

describe('usePasskeySignIn step wiring', () => {
  it('passes accountHasTotp from the account lookup through to handleNavigation', async () => {
    const { args, spies } = buildArgs();
    spies.account.mockResolvedValue({
      emails: [{ email: EMAIL, isPrimary: true, verified: true }],
      totp: { exists: true, verified: true },
    });

    const { result } = renderHook(() => usePasskeySignIn(args), { wrapper });
    await act(() => result.current.onClick());

    expect(handleNavigation).toHaveBeenCalledWith(
      expect.objectContaining({ isPasskeySession: true, accountHasTotp: true })
    );
  });
});
