/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import AuthenticationMethods from '../../constants/authentication-methods';
import {
  MOCK_EMAIL,
  MOCK_KEY_FETCH_TOKEN,
  MOCK_OAUTH_FLOW_HANDLER_RESPONSE,
  MOCK_SESSION_TOKEN,
  MOCK_STORED_ACCOUNT,
  MOCK_UID,
} from '../mocks';
import { NavigationOptions } from './interfaces';
import {
  createMockSigninOAuthNativeSyncIntegration,
  createMockSigninOAuthNativeIntegration,
  createMockSigninOAuthIntegration,
} from './mocks';
import {
  cachedSignIn,
  handleNavigation,
  ensureCanLinkAcountOrRedirect,
  getSyncNavigate,
} from './utils';
import * as ReachRouter from '@reach/router';
import * as ReactUtils from 'fxa-react/lib/utils';
import * as CacheModule from '../../lib/cache';
import firefox from '../../lib/channels/firefox';
import config from '../../lib/config';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { OAuthNativeServices } from '@fxa/accounts/oauth';

jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  navigate: jest.fn(),
}));

jest.mock('../../lib/channels/firefox', () => ({
  __esModule: true,
  default: {
    fxaLogin: jest.fn(),
    fxaOAuthLogin: jest.fn(),
    fxaCanLinkAccount: jest.fn(),
  },
}));

jest.mock('../../lib/config', () => {
  const actual = jest.requireActual('../../lib/config');
  return {
    ...actual,
    __esModule: true,
    default: {
      ...actual.default,
      showReactApp: { ...actual.default.showReactApp, pairRoutes: true },
    },
  };
});

const navigateSpy = jest.spyOn(ReachRouter, 'navigate');
const hardNavigateSpy = jest.spyOn(ReactUtils, 'hardNavigate');
const fxaLoginSpy = jest.spyOn(firefox, 'fxaLogin');
const fxaCanLinkAccountSpy = jest.spyOn(firefox, 'fxaCanLinkAccount');

describe('Signin utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleNavigation', () => {
    const createBaseNavigationOptions = (
      overrides: Partial<NavigationOptions> = {}
    ): NavigationOptions =>
      ({
        email: MOCK_EMAIL,
        signinData: {
          uid: MOCK_UID,
          sessionToken: MOCK_SESSION_TOKEN,
          emailVerified: true,
          sessionVerified: true,
          verificationMethod: VerificationMethods.EMAIL,
          verificationReason: VerificationReasons.SIGN_IN,
          keyFetchToken: MOCK_KEY_FETCH_TOKEN,
        },
        redirectTo: '',
        finishOAuthFlowHandler: jest
          .fn()
          .mockReturnValue(MOCK_OAUTH_FLOW_HANDLER_RESPONSE),
        queryParams: '',
        ...overrides,
      }) as NavigationOptions;

    it('does not navigate if performNavigation is false', async () => {
      const navigationOptions = createBaseNavigationOptions({
        integration: createMockSigninOAuthNativeSyncIntegration({
          isMobile: true,
        }),
        performNavigation: false,
      });
      const { error } = await handleNavigation(navigationOptions);

      expect(error).toBeUndefined();
      expect(navigateSpy).not.toHaveBeenCalled();
      expect(hardNavigateSpy).not.toHaveBeenCalled();
    });

    it('sends fxaLogin with smartwindow services and navigates to settings for OAuthNative service=smartwindow', async () => {
      const navigationOptions = createBaseNavigationOptions({
        integration: createMockSigninOAuthNativeIntegration({
          isSync: false,
          service: OAuthNativeServices.SmartWindow,
        }),
        performNavigation: true,
        handleFxaLogin: true,
      });
      const result = await handleNavigation(navigationOptions);

      expect(fxaLoginSpy).toHaveBeenCalledWith({
        email: MOCK_EMAIL,
        sessionToken: MOCK_SESSION_TOKEN,
        uid: MOCK_UID,
        verified: true,
        services: { smartwindow: {} },
      });
      expect(result.error).toBeUndefined();
      expect(navigateSpy).toHaveBeenCalledWith('/settings', { replace: true });
    });

    it('navigates to settings when isSessionAALUpgrade is true, even when performNavigation: false', async () => {
      const navigationOptions = createBaseNavigationOptions({
        integration: createMockSigninOAuthNativeSyncIntegration(),
        isSessionAALUpgrade: true,
        performNavigation: false,
      });
      const result = await handleNavigation(navigationOptions);

      expect(result.error).toBeUndefined();
      expect(navigateSpy).toHaveBeenCalledWith('/settings');
      expect(hardNavigateSpy).not.toHaveBeenCalled();
      expect(fxaLoginSpy).not.toHaveBeenCalled();
    });

    describe('unverified session navigation', () => {
      it('returns early for SIGN_UP verification reason', async () => {
        const navigationOptions = createBaseNavigationOptions({
          signinData: {
            ...createBaseNavigationOptions().signinData,
            emailVerified: false,
            sessionVerified: false,
            verificationReason: VerificationReasons.SIGN_UP,
          },
          integration: createMockSigninOAuthIntegration(),
        });

        const result = await handleNavigation(navigationOptions);

        expect(result.error).toBeUndefined();
        expect(navigateSpy).toHaveBeenCalledWith(
          '/confirm_signup_code',
          expect.any(Object)
        );
      });

      it('returns early for TOTP verification method', async () => {
        const navigationOptions = createBaseNavigationOptions({
          signinData: {
            ...createBaseNavigationOptions().signinData,
            emailVerified: true,
            sessionVerified: false,
            verificationMethod: VerificationMethods.TOTP_2FA,
          },
          integration: createMockSigninOAuthIntegration(),
        });

        const result = await handleNavigation(navigationOptions);

        expect(result.error).toBeUndefined();
        expect(navigateSpy).toHaveBeenCalledWith(
          '/signin_totp_code',
          expect.any(Object)
        );
      });

      it('returns early for OAuth integration with wantsTwoStepAuthentication', async () => {
        const mockOAuthIntegration = createMockSigninOAuthIntegration();
        mockOAuthIntegration.wantsTwoStepAuthentication = jest
          .fn()
          .mockReturnValue(true);

        const navigationOptions = createBaseNavigationOptions({
          signinData: {
            ...createBaseNavigationOptions().signinData,
            emailVerified: true,
            sessionVerified: false,
            verificationMethod: VerificationMethods.EMAIL,
            verificationReason: VerificationReasons.SIGN_IN,
          },
          integration: mockOAuthIntegration,
        });

        const result = await handleNavigation(navigationOptions);

        expect(result.error).toBeUndefined();
        expect(navigateSpy).toHaveBeenCalledWith(
          '/signin_token_code',
          expect.any(Object)
        );
      });

      it('navigates to OAuth redirect for successful OAuth flow', async () => {
        const mockOAuthIntegration = createMockSigninOAuthIntegration();
        (mockOAuthIntegration as any).requiresKeys = jest
          .fn()
          .mockReturnValue(false);

        const navigationOptions = createBaseNavigationOptions({
          signinData: {
            ...createBaseNavigationOptions().signinData,
            emailVerified: false,
            sessionVerified: false,
            verificationMethod: VerificationMethods.EMAIL,
            verificationReason: VerificationReasons.SIGN_IN,
          },
          integration: mockOAuthIntegration,
          finishOAuthFlowHandler: jest.fn().mockReturnValue({
            redirect: 'https://example.com/callback',
            code: 'test-code',
            state: 'test-state',
          }),
        });

        const result = await handleNavigation(navigationOptions);

        expect(result.error).toBeUndefined();
        expect(hardNavigateSpy).toHaveBeenCalledWith(
          'https://example.com/callback',
          undefined,
          undefined,
          true
        );
      });

      it('returns early for OAuth integration that isServiceWithEmailVerification', async () => {
        const mockOAuthIntegration = createMockSigninOAuthIntegration();
        const sendVerificationCode = jest.fn().mockResolvedValue(undefined);

        const navigationOptions = createBaseNavigationOptions({
          signinData: {
            ...createBaseNavigationOptions().signinData,
            emailVerified: true,
            sessionVerified: false,
            verificationMethod: VerificationMethods.EMAIL,
            verificationReason: VerificationReasons.SIGN_IN,
          },
          isServiceWithEmailVerification: true,
          integration: mockOAuthIntegration,
          sendVerificationCode,
        });

        const result = await handleNavigation(navigationOptions);

        expect(result.error).toBeUndefined();
        expect(sendVerificationCode).toHaveBeenCalledTimes(1);
        expect(navigateSpy).toHaveBeenCalledWith(
          '/signin_token_code',
          expect.any(Object)
        );
      });

      it('returns early for OAuth integration with wantsKeys', async () => {
        const mockOAuthIntegration = createMockSigninOAuthIntegration();
        (mockOAuthIntegration as any).wantsKeys = jest
          .fn()
          .mockReturnValue(true);
        const sendVerificationCode = jest.fn().mockResolvedValue(undefined);

        const navigationOptions = createBaseNavigationOptions({
          signinData: {
            ...createBaseNavigationOptions().signinData,
            emailVerified: true,
            sessionVerified: false,
            verificationMethod: VerificationMethods.EMAIL,
            verificationReason: VerificationReasons.SIGN_IN,
          },
          integration: mockOAuthIntegration,
          sendVerificationCode,
        });

        const result = await handleNavigation(navigationOptions);

        expect(result.error).toBeUndefined();
        expect(sendVerificationCode).toHaveBeenCalledTimes(1);
        expect(navigateSpy).toHaveBeenCalledWith(
          '/signin_token_code',
          expect.any(Object)
        );
      });

      it('does not send fxaLogin if TOTP verification required', async () => {
        const navigationOptions = createBaseNavigationOptions({
          signinData: {
            ...createBaseNavigationOptions().signinData,
            emailVerified: false,
            sessionVerified: false,
            verificationMethod: VerificationMethods.TOTP_2FA,
          },
          integration: createMockSigninOAuthNativeSyncIntegration(),
          handleFxaLogin: true,
        });

        const result = await handleNavigation(navigationOptions);

        expect(result.error).toBeUndefined();
        expect(fxaLoginSpy).not.toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(
          '/signin_totp_code',
          expect.any(Object)
        );
      });
    });

    describe('third party auth with non-Sync services', () => {
      it('sends fxaOAuthLogin and navigates to settings', async () => {
        const fxaOAuthLoginSpy = jest.spyOn(firefox, 'fxaOAuthLogin');
        const navigationOptions = createBaseNavigationOptions({
          integration: createMockSigninOAuthNativeIntegration({
            isSync: false,
            service: OAuthNativeServices.Relay,
          }),
          isSignInWithThirdPartyAuth: true,
          performNavigation: true,
          handleFxaOAuthLogin: true,
        });

        const result = await handleNavigation(navigationOptions);

        expect(result.error).toBeUndefined();
        expect(fxaOAuthLoginSpy).toHaveBeenCalledWith({
          action: 'signin',
          code: MOCK_OAUTH_FLOW_HANDLER_RESPONSE.code,
          redirect: MOCK_OAUTH_FLOW_HANDLER_RESPONSE.redirect,
          state: MOCK_OAUTH_FLOW_HANDLER_RESPONSE.state,
        });
        expect(navigateSpy).toHaveBeenCalledWith('/settings', {
          replace: true,
        });
      });

      it('navigates to service_welcome with origin=signin for service=vpn', async () => {
        const fxaOAuthLoginSpy = jest.spyOn(firefox, 'fxaOAuthLogin');
        const navigationOptions = createBaseNavigationOptions({
          integration: createMockSigninOAuthNativeIntegration({
            isSync: false,
            service: OAuthNativeServices.Vpn,
          }),
          performNavigation: true,
          handleFxaOAuthLogin: true,
        });

        const result = await handleNavigation(navigationOptions);

        expect(result.error).toBeUndefined();
        expect(fxaOAuthLoginSpy).toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(
          '/post_verify/service_welcome',
          {
            state: { origin: 'signin' },
            replace: true,
          }
        );
      });
    });

    describe('handleNavigation with send-tab entrypoints', () => {
      const createSendTabNavigationOptions = (
        overrides: Partial<NavigationOptions> = {}
      ): NavigationOptions =>
        ({
          email: MOCK_EMAIL,
          signinData: {
            uid: MOCK_UID,
            sessionToken: MOCK_SESSION_TOKEN,
            emailVerified: true,
            sessionVerified: true,
            verificationMethod: VerificationMethods.EMAIL,
            verificationReason: VerificationReasons.SIGN_IN,
            keyFetchToken: MOCK_KEY_FETCH_TOKEN,
          },
          redirectTo: '',
          finishOAuthFlowHandler: jest
            .fn()
            .mockReturnValue(MOCK_OAUTH_FLOW_HANDLER_RESPONSE),
          queryParams: '',
          ...overrides,
        }) as NavigationOptions;

      it('clears showInlineRecoveryKeySetup for send-tab sign-in and soft-navs to /pair', async () => {
        const integration = createMockSigninOAuthNativeSyncIntegration();
        integration.data.entrypoint = 'send-tab-toolbar-icon';
        const navigationOptions = createSendTabNavigationOptions({
          integration,
          queryParams: '?service=sync',
          showInlineRecoveryKeySetup: true,
          handleFxaLogin: true,
        });

        await handleNavigation(navigationOptions);

        expect(hardNavigateSpy).not.toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalled();
        const [navigatedUrl, options] = navigateSpy.mock.calls[0];
        expect(navigatedUrl).toContain('/pair?');
        expect(navigatedUrl).not.toContain('inline_recovery_key');
        expect(navigatedUrl).not.toContain('showSuccessMessage');
        expect(
          (options as unknown as { state: { origin: string } }).state.origin
        ).toBe('signin');
      });

      it('clears showSignupConfirmedSync for send-tab post-verify and soft-navs with origin=post-verify-set-password', async () => {
        const integration = createMockSigninOAuthNativeSyncIntegration();
        integration.data.entrypoint = 'send-tab-app-menu';
        const navigationOptions = createSendTabNavigationOptions({
          integration,
          queryParams: '?service=sync',
          showSignupConfirmedSync: true,
          origin: 'post-verify-set-password',
          handleFxaLogin: true,
        });

        await handleNavigation(navigationOptions);

        expect(hardNavigateSpy).not.toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalled();
        const [navigatedUrl, options] = navigateSpy.mock.calls[0];
        expect(navigatedUrl).toContain('/pair?');
        expect(navigatedUrl).not.toContain('passwordCreated');
        expect(
          (options as unknown as { state: { origin: string } }).state.origin
        ).toBe('post-verify-set-password');
      });
    });
  });

  describe('ensureCanLinkAcountOrRedirect', () => {
    const mockFtlMsgResolver = {
      getMsg: jest.fn().mockReturnValue('Login attempt cancelled'),
    };
    const mockNavigateWithQuery = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('returns true when user accepts', async () => {
      fxaCanLinkAccountSpy.mockResolvedValue({ ok: true });

      const result = await ensureCanLinkAcountOrRedirect({
        email: MOCK_EMAIL,
        uid: MOCK_UID,
        ftlMsgResolver: mockFtlMsgResolver as any,
        navigateWithQuery: mockNavigateWithQuery as any,
      });

      expect(result).toBe(true);
      expect(fxaCanLinkAccountSpy).toHaveBeenCalledWith({
        email: MOCK_EMAIL,
        uid: MOCK_UID,
      });
      expect(mockNavigateWithQuery).not.toHaveBeenCalled();
    });

    it('navigates to Index with error banner when user cancels', async () => {
      const linkedAccountEmail = 'user@example.com';
      const linkedAccountUid = '123';
      fxaCanLinkAccountSpy.mockResolvedValue({ ok: false });

      const result = await ensureCanLinkAcountOrRedirect({
        email: linkedAccountEmail,
        uid: linkedAccountUid,
        ftlMsgResolver: mockFtlMsgResolver as any,
        navigateWithQuery: mockNavigateWithQuery as any,
      });

      expect(result).toBe(false);
      expect(fxaCanLinkAccountSpy).toHaveBeenCalledWith({
        email: linkedAccountEmail,
        uid: linkedAccountUid,
      });
      expect(mockNavigateWithQuery).toHaveBeenCalledWith('/', {
        replace: true,
        state: {
          localizedErrorFromLocationState: 'Login attempt cancelled',
          prefillEmail: linkedAccountEmail,
        },
      });
    });
  });

  describe('getSyncNavigate', () => {
    it('returns /inline_recovery_key_setup when showInlineRecoveryKeySetup is true', () => {
      const result = getSyncNavigate('?service=sync', {
        showInlineRecoveryKeySetup: true,
      });
      expect(result.to).toContain('/inline_recovery_key_setup?');
    });

    it('returns /signup_confirmed_sync when showSignupConfirmedSync is true', () => {
      const result = getSyncNavigate('?service=sync', {
        showSignupConfirmedSync: true,
      });
      expect(result.to).toContain('/signup_confirmed_sync?');
    });

    describe('/pair redirect (Backbone path, pairRoutes=false)', () => {
      beforeEach(() => {
        config.showReactApp.pairRoutes = false;
      });
      afterEach(() => {
        config.showReactApp.pairRoutes = true;
      });

      it('returns /pair with showSuccessMessage by default', () => {
        const result = getSyncNavigate('?service=sync');
        expect(result.to).toContain('/pair?');
        expect(result.to).toContain('showSuccessMessage=true');
        expect(result.shouldHardNavigate).toBe(true);
        expect(result.locationState).toBeUndefined();
      });

      it('includes signupSuccess param when signupSuccess is true', () => {
        const result = getSyncNavigate('?service=sync', {
          signupSuccess: true,
        });
        expect(result.to).toContain('/pair?');
        expect(result.to).toContain('signupSuccess=true');
        expect(result.to).toContain('showSuccessMessage=true');
      });

      it('includes passwordCreated param when origin is post-verify-set-password', () => {
        const result = getSyncNavigate('?service=sync', {
          origin: 'post-verify-set-password',
        });
        expect(result.to).toContain('/pair?');
        expect(result.to).toContain('passwordCreated=true');
        expect(result.to).toContain('showSuccessMessage=true');
      });

      it('does not include passwordCreated for other origins', () => {
        const result = getSyncNavigate('?service=sync', {
          origin: 'signup',
        });
        expect(result.to).not.toContain('passwordCreated');
      });
    });

    describe('/pair redirect (React path, pairRoutes=true)', () => {
      // pairRoutes=true is the test-file default; no toggling needed.

      it('soft-navs to /pair with origin=signin by default', () => {
        const result = getSyncNavigate('?service=sync');
        expect(result.to).toContain('/pair?');
        expect(result.to).not.toContain('showSuccessMessage');
        expect(result.shouldHardNavigate).toBe(false);
        expect(result.locationState).toEqual({ origin: 'signin' });
      });

      it('soft-navs with origin=signup when signupSuccess', () => {
        const result = getSyncNavigate('?service=sync', {
          signupSuccess: true,
        });
        expect(result.to).not.toContain('signupSuccess');
        expect(result.shouldHardNavigate).toBe(false);
        expect(result.locationState).toEqual({ origin: 'signup' });
      });

      it('soft-navs with origin=post-verify-set-password when set-password flow', () => {
        const result = getSyncNavigate('?service=sync', {
          origin: 'post-verify-set-password',
        });
        expect(result.to).not.toContain('passwordCreated');
        expect(result.shouldHardNavigate).toBe(false);
        expect(result.locationState).toEqual({
          origin: 'post-verify-set-password',
        });
      });

      it('omits the trailing "?" when queryParams is empty', () => {
        const result = getSyncNavigate('');
        expect(result.to).toBe('/pair');
        expect(result.shouldHardNavigate).toBe(false);
      });
    });
  });

  describe('cachedSignIn', () => {
    type SessionStatusDetails = {
      accountEmailVerified: boolean;
      sessionVerified: boolean;
      sessionVerificationMethod: string | null;
      sessionVerificationMeetsMinimumAAL: boolean;
    };

    const createMockAuthClient = ({
      authenticationMethods = [] as AuthenticationMethods[],
      details,
      accountProfileRejection,
    }: {
      authenticationMethods?: AuthenticationMethods[];
      details?: Partial<SessionStatusDetails>;
      accountProfileRejection?: unknown;
    } = {}) => {
      const accountProfile = accountProfileRejection
        ? jest.fn().mockRejectedValue(accountProfileRejection)
        : jest.fn().mockResolvedValue({ authenticationMethods });
      const sessionStatus = jest.fn().mockResolvedValue({
        state: 'unverified',
        uid: MOCK_UID,
        details: {
          accountEmailVerified: true,
          sessionVerified: false,
          sessionVerificationMethod: null,
          sessionVerificationMeetsMinimumAAL: true,
          ...details,
        },
      });
      return { accountProfile, sessionStatus } as any;
    };

    const createMockSession = () =>
      ({
        sendVerificationCode: jest.fn().mockResolvedValue(undefined),
      }) as any;

    let currentAccountSpy: jest.SpyInstance;
    let discardSessionTokenSpy: jest.SpyInstance;

    beforeEach(() => {
      currentAccountSpy = jest
        .spyOn(CacheModule, 'currentAccount')
        .mockReturnValue(MOCK_STORED_ACCOUNT);
      discardSessionTokenSpy = jest
        .spyOn(CacheModule, 'discardSessionToken')
        .mockImplementation(() => {});
    });

    afterEach(() => {
      currentAccountSpy.mockRestore();
      discardSessionTokenSpy.mockRestore();
    });

    it('returns SIGN_IN/EMAIL_OTP with a sendVerificationCode callback when session is unverified', async () => {
      const authClient = createMockAuthClient({
        details: { sessionVerified: false },
      });
      const session = createMockSession();

      const result = await cachedSignIn(MOCK_SESSION_TOKEN, authClient, session);

      expect(result.data?.verificationReason).toBe(VerificationReasons.SIGN_IN);
      expect(result.data?.verificationMethod).toBe(VerificationMethods.EMAIL_OTP);
      expect(result.data?.sendVerificationCode).toBeInstanceOf(Function);
      expect(result.data?.sessionVerified).toBe(false);
      expect(result.data?.emailVerified).toBe(true);
      expect(result.data?.totpIsActive).toBe(false);
      // The code is not sent here — handleNavigation calls the callback only
      // when actually routing to a confirmation-code page.
      expect(session.sendVerificationCode).not.toHaveBeenCalled();
    });

    it('returns a sendVerificationCode callback for SUMO-like RPs (unverified session, no keys required)', async () => {
      // Regression test: previously cachedSignIn eagerly called sendVerificationCode
      // for any unverified session, sending a spurious email to users of OAuth RPs
      // (e.g. SUMO) that don't require session verification. Now the callback is
      // returned but handleNavigation only calls it when routing to the code page.
      const authClient = createMockAuthClient({
        details: { sessionVerified: false },
      });
      const session = createMockSession();

      const result = await cachedSignIn(MOCK_SESSION_TOKEN, authClient, session);

      expect(session.sendVerificationCode).not.toHaveBeenCalled();
      expect(result.data?.sendVerificationCode).toBeInstanceOf(Function);
      expect(result.data?.verificationReason).toBe(VerificationReasons.SIGN_IN);
      expect(result.data?.verificationMethod).toBe(VerificationMethods.EMAIL_OTP);
    });

    it('returns TOTP_2FA with no sendVerificationCode callback when TOTP is active', async () => {
      const authClient = createMockAuthClient({
        authenticationMethods: [AuthenticationMethods.OTP],
        details: { sessionVerified: false },
      });
      const session = createMockSession();

      const result = await cachedSignIn(MOCK_SESSION_TOKEN, authClient, session);

      expect(session.sendVerificationCode).not.toHaveBeenCalled();
      expect(result.data?.sendVerificationCode).toBeUndefined();
      expect(result.data?.verificationReason).toBe(VerificationReasons.SIGN_IN);
      expect(result.data?.verificationMethod).toBe(VerificationMethods.TOTP_2FA);
      expect(result.data?.totpIsActive).toBe(true);
    });

    it('returns SIGN_UP/EMAIL_OTP with a sendVerificationCode callback when the primary email is unverified', async () => {
      const authClient = createMockAuthClient({
        details: { accountEmailVerified: false, sessionVerified: false },
      });
      const session = createMockSession();

      const result = await cachedSignIn(MOCK_SESSION_TOKEN, authClient, session);

      expect(session.sendVerificationCode).not.toHaveBeenCalled();
      expect(result.data?.sendVerificationCode).toBeInstanceOf(Function);
      expect(result.data?.verificationReason).toBe(VerificationReasons.SIGN_UP);
      expect(result.data?.verificationMethod).toBe(VerificationMethods.EMAIL_OTP);
    });

    it('returns no verification fields and no sendVerificationCode when the session is already verified', async () => {
      const authClient = createMockAuthClient({
        details: { sessionVerified: true },
      });
      const session = createMockSession();

      const result = await cachedSignIn(MOCK_SESSION_TOKEN, authClient, session);

      expect(session.sendVerificationCode).not.toHaveBeenCalled();
      expect(result.data?.sendVerificationCode).toBeUndefined();
      expect(result.data?.verificationReason).toBeUndefined();
      expect(result.data?.verificationMethod).toBeUndefined();
      expect(result.data?.sessionVerified).toBe(true);
    });

    it('discards the session token and returns SESSION_EXPIRED when accountProfile reports an invalid token', async () => {
      const authClient = createMockAuthClient({
        accountProfileRejection: { errno: AuthUiErrors.INVALID_TOKEN.errno },
      });
      const session = createMockSession();

      const result = await cachedSignIn(MOCK_SESSION_TOKEN, authClient, session);

      expect(discardSessionTokenSpy).toHaveBeenCalledTimes(1);
      expect(result.error).toBe(AuthUiErrors.SESSION_EXPIRED);
      expect(session.sendVerificationCode).not.toHaveBeenCalled();
    });
  });
});
