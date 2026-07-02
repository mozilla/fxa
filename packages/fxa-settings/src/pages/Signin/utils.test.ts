/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import {
  MOCK_EMAIL,
  MOCK_KEY_FETCH_TOKEN,
  MOCK_OAUTH_FLOW_HANDLER_RESPONSE,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
} from '../mocks';
import { NavigationOptions, SigninIntegration } from './interfaces';
import {
  createMockSigninOAuthNativeSyncIntegration,
  createMockSigninOAuthNativeIntegration,
  createMockSigninOAuthIntegration,
  createMockSigninWebIntegration,
} from './mocks';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import {
  handleNavigation,
  ensureCanLinkAcountOrRedirect,
  getSyncNavigate,
} from './utils';
import * as ReachRouter from '@reach/router';
import * as ReactUtils from 'fxa-react/lib/utils';
import firefox from '../../lib/channels/firefox';
import config from '../../lib/config';
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

    it('replaces history on a set-password completion so Back cannot return to it', async () => {
      const navigationOptions = createBaseNavigationOptions({
        integration: {
          ...createMockSigninWebIntegration(),
          isSync: () => true,
        },
        queryParams: '?service=sync',
        showSignupConfirmedSync: true,
        origin: 'post-verify-set-password',
        performNavigation: true,
        handleFxaLogin: true,
      });

      await handleNavigation(navigationOptions);

      expect(navigateSpy).toHaveBeenCalledWith(
        expect.stringContaining('/signup_confirmed_sync'),
        expect.objectContaining({ replace: true })
      );
    });

    it('does not replace history for a Sync sign-in that is not a set-password completion', async () => {
      const navigationOptions = createBaseNavigationOptions({
        integration: {
          ...createMockSigninWebIntegration(),
          isSync: () => true,
        },
        queryParams: '?service=sync',
        showSignupConfirmedSync: true,
        performNavigation: true,
        handleFxaLogin: true,
      });

      await handleNavigation(navigationOptions);

      expect(navigateSpy).toHaveBeenCalledWith(
        expect.stringContaining('/signup_confirmed_sync'),
        expect.objectContaining({ replace: false })
      );
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
        });

        const result = await handleNavigation(navigationOptions);

        expect(result.error).toBeUndefined();
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

    describe('email OTP resend before verification pages', () => {
      it('resends the email OTP code when navigating to /signin_token_code with an EMAIL_OTP verification method', async () => {
        const sessionResendVerifyCode = jest.fn().mockResolvedValue({});
        const navigationOptions = createBaseNavigationOptions({
          signinData: {
            ...createBaseNavigationOptions().signinData,
            emailVerified: true,
            sessionVerified: false,
            verificationMethod: VerificationMethods.EMAIL_OTP,
            verificationReason: VerificationReasons.SIGN_IN,
          },
          isServiceWithEmailVerification: true,
          integration: createMockSigninOAuthIntegration(),
          authClient: { sessionResendVerifyCode },
        });

        const result = await handleNavigation(navigationOptions);

        expect(result.error).toBeUndefined();
        expect(sessionResendVerifyCode).toHaveBeenCalledWith(
          MOCK_SESSION_TOKEN
        );
        expect(navigateSpy).toHaveBeenCalledWith(
          '/signin_token_code',
          expect.any(Object)
        );
      });

      it('resends the email OTP code when navigating to /confirm_signup_code with an EMAIL_OTP verification method', async () => {
        const sessionResendVerifyCode = jest.fn().mockResolvedValue({});
        const navigationOptions = createBaseNavigationOptions({
          signinData: {
            ...createBaseNavigationOptions().signinData,
            emailVerified: false,
            sessionVerified: false,
            verificationMethod: VerificationMethods.EMAIL_OTP,
            verificationReason: VerificationReasons.SIGN_UP,
          },
          isServiceWithEmailVerification: true,
          integration: createMockSigninOAuthIntegration(),
          authClient: { sessionResendVerifyCode },
        });

        const result = await handleNavigation(navigationOptions);

        expect(result.error).toBeUndefined();
        expect(sessionResendVerifyCode).toHaveBeenCalledWith(MOCK_SESSION_TOKEN);
        expect(navigateSpy).toHaveBeenCalledWith(
          '/confirm_signup_code',
          expect.any(Object)
        );
      });

      it('does not resend the email OTP code when the verification method is not EMAIL_OTP', async () => {
        const sessionResendVerifyCode = jest.fn().mockResolvedValue({});
        const navigationOptions = createBaseNavigationOptions({
          signinData: {
            ...createBaseNavigationOptions().signinData,
            emailVerified: true,
            sessionVerified: false,
            verificationMethod: VerificationMethods.EMAIL,
            verificationReason: VerificationReasons.SIGN_IN,
          },
          isServiceWithEmailVerification: true,
          integration: createMockSigninOAuthIntegration(),
          authClient: { sessionResendVerifyCode },
        });

        const result = await handleNavigation(navigationOptions);

        expect(result.error).toBeUndefined();
        expect(sessionResendVerifyCode).not.toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(
          '/signin_token_code',
          expect.any(Object)
        );
      });

      it('does not resend the email OTP code when navigating to a non-email verification page such as /signin_totp_code', async () => {
        const sessionResendVerifyCode = jest.fn().mockResolvedValue({});
        const navigationOptions = createBaseNavigationOptions({
          signinData: {
            ...createBaseNavigationOptions().signinData,
            emailVerified: true,
            sessionVerified: false,
            verificationMethod: VerificationMethods.TOTP_2FA,
            verificationReason: VerificationReasons.SIGN_IN,
          },
          isServiceWithEmailVerification: true,
          integration: createMockSigninOAuthIntegration(),
          authClient: { sessionResendVerifyCode },
        });

        const result = await handleNavigation(navigationOptions);

        expect(result.error).toBeUndefined();
        expect(sessionResendVerifyCode).not.toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(
          '/signin_totp_code',
          expect.any(Object)
        );
      });
    });

    describe('third party auth with non-Sync services', () => {
      it('sends fxaOAuthLogin and navigates to settings when the service does not need keys', async () => {
        const fxaOAuthLoginSpy = jest.spyOn(firefox, 'fxaOAuthLogin');
        const integration = createMockSigninOAuthNativeIntegration({
          isSync: false,
          service: OAuthNativeServices.Relay,
        });
        // A non-Sync service that doesn't request keys (no keysJwk) signs in
        // directly — no password needed, so no set_password detour.
        integration.wantsKeysIfPasswordEntered = () => false;
        const navigationOptions = createBaseNavigationOptions({
          integration,
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
          scope: MOCK_OAUTH_FLOW_HANDLER_RESPONSE.scope,
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

      // "keys not optional" = Firefox where Sync isn't decoupled: desktop
      // before 147, and Mobile as of Firefox 153.
      it('routes service=vpn third-party auth to set_password when keys are not optional', async () => {
        const fxaOAuthLoginSpy = jest.spyOn(firefox, 'fxaOAuthLogin');
        const navigationOptions = createBaseNavigationOptions({
          integration: createMockSigninOAuthNativeIntegration({
            isSync: false,
            service: OAuthNativeServices.Vpn,
          }),
          isSignInWithThirdPartyAuth: true,
          supportsKeysOptionalLogin: false,
          performNavigation: true,
          handleFxaOAuthLogin: false,
        });

        const result = await handleNavigation(navigationOptions);

        expect(result.error).toBeUndefined();
        // The OAuth login must be deferred until after the password is set,
        // otherwise the browser receives keyless keys_jwe.
        expect(fxaOAuthLoginSpy).not.toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(
          expect.stringContaining('/post_verify/set_password'),
          expect.objectContaining({
            state: expect.objectContaining({
              passwordCreationReason: 'third_party_auth',
            }),
            replace: true,
          })
        );
      });

      // keys-optional login = Sync decoupled (Firefox desktop 147+).
      it('routes service=vpn third-party auth to service_welcome when the browser supports keys-optional login', async () => {
        const fxaOAuthLoginSpy = jest.spyOn(firefox, 'fxaOAuthLogin');
        const navigationOptions = createBaseNavigationOptions({
          integration: createMockSigninOAuthNativeIntegration({
            isSync: false,
            service: OAuthNativeServices.Vpn,
          }),
          isSignInWithThirdPartyAuth: true,
          supportsKeysOptionalLogin: true,
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

    describe('passkey-session AAL2 gate', () => {
      const buildPasskeyOAuthOptions = (
        overrides: Partial<NavigationOptions> = {}
      ) => {
        const integration = createMockSigninOAuthIntegration();
        integration.wantsTwoStepAuthentication = jest
          .fn()
          .mockReturnValue(true);
        return createBaseNavigationOptions({
          integration,
          isPasskeySession: true,
          queryParams: '?client_id=abc',
          ...overrides,
        });
      };

      it('diverts to /inline_totp_setup when the account has no TOTP', async () => {
        const finishOAuthFlowHandler = jest.fn();
        const navigationOptions = buildPasskeyOAuthOptions({
          accountHasTotp: false,
          finishOAuthFlowHandler,
        });

        const result = await handleNavigation(navigationOptions);

        expect(result.error).toBeUndefined();
        expect(finishOAuthFlowHandler).not.toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(
          '/inline_totp_setup?client_id=abc',
          expect.objectContaining({ replace: true })
        );
      });

      it('diverts a cached session (not a fresh passkey ceremony) when the account has no TOTP', async () => {
        // A cached passkey session is session-AAL2 without isPasskeySession set.
        // The divert must still fire so an AAL2 RP does not bounce indefinitely.
        const finishOAuthFlowHandler = jest.fn();
        const navigationOptions = buildPasskeyOAuthOptions({
          isPasskeySession: false,
          accountHasTotp: false,
          finishOAuthFlowHandler,
        });

        const result = await handleNavigation(navigationOptions);

        expect(result.error).toBeUndefined();
        expect(finishOAuthFlowHandler).not.toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(
          '/inline_totp_setup?client_id=abc',
          expect.objectContaining({ replace: true })
        );
      });

      it('continues to OAuth redirect when the account already has TOTP', async () => {
        const finishOAuthFlowHandler = jest
          .fn()
          .mockResolvedValue(MOCK_OAUTH_FLOW_HANDLER_RESPONSE);
        const navigationOptions = buildPasskeyOAuthOptions({
          accountHasTotp: true,
          finishOAuthFlowHandler,
        });

        await handleNavigation(navigationOptions);

        expect(finishOAuthFlowHandler).toHaveBeenCalledTimes(1);
        expect(hardNavigateSpy).toHaveBeenCalledWith(
          MOCK_OAUTH_FLOW_HANDLER_RESPONSE.redirect,
          undefined,
          undefined,
          true
        );
      });

      it('continues to OAuth redirect when the RP does not require AAL2', async () => {
        const integration = createMockSigninOAuthIntegration();
        integration.wantsTwoStepAuthentication = jest
          .fn()
          .mockReturnValue(false);
        const finishOAuthFlowHandler = jest
          .fn()
          .mockResolvedValue(MOCK_OAUTH_FLOW_HANDLER_RESPONSE);

        const navigationOptions = createBaseNavigationOptions({
          integration,
          isPasskeySession: true,
          accountHasTotp: false,
          finishOAuthFlowHandler,
        });

        await handleNavigation(navigationOptions);

        expect(finishOAuthFlowHandler).toHaveBeenCalledTimes(1);
        expect(hardNavigateSpy).toHaveBeenCalled();
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

    describe('auth state machine routing (flag on, plain Web)', () => {
      it('routes a fully verified signin to /settings and preserves the query param', async () => {
        const navigationOptions = createBaseNavigationOptions({
          integration: createMockSigninWebIntegration(),
          queryParams: '?authStateMachine=true',
          signinData: {
            uid: MOCK_UID,
            sessionToken: MOCK_SESSION_TOKEN,
            keyFetchToken: MOCK_KEY_FETCH_TOKEN,
            emailVerified: true,
            sessionVerified: true,
            verificationMethod: VerificationMethods.EMAIL,
            verificationReason: VerificationReasons.SIGN_IN,
          },
        });
        await handleNavigation(navigationOptions);
        expect(navigateSpy).toHaveBeenCalledWith(
          '/settings?authStateMachine=true',
          expect.anything()
        );
      });

      it('routes a TOTP account to /signin_totp_code and preserves the query param', async () => {
        const navigationOptions = createBaseNavigationOptions({
          integration: createMockSigninWebIntegration(),
          queryParams: '?authStateMachine=true',
          signinData: {
            uid: MOCK_UID,
            sessionToken: MOCK_SESSION_TOKEN,
            keyFetchToken: MOCK_KEY_FETCH_TOKEN,
            emailVerified: true,
            sessionVerified: false,
            verificationMethod: VerificationMethods.TOTP_2FA,
            verificationReason: VerificationReasons.SIGN_IN,
          },
          accountHasTotp: true,
        });
        await handleNavigation(navigationOptions);
        expect(navigateSpy).toHaveBeenCalledWith(
          '/signin_totp_code?authStateMachine=true',
          expect.anything()
        );
      });

      it('routes an unverified-session email-otp signin to /signin_token_code and preserves the query param', async () => {
        const navigationOptions = createBaseNavigationOptions({
          integration: createMockSigninWebIntegration(),
          queryParams: '?authStateMachine=true',
          signinData: {
            uid: MOCK_UID,
            sessionToken: MOCK_SESSION_TOKEN,
            keyFetchToken: MOCK_KEY_FETCH_TOKEN,
            emailVerified: true,
            sessionVerified: false,
            verificationMethod: VerificationMethods.EMAIL_OTP,
            verificationReason: VerificationReasons.SIGN_IN,
          },
        });
        await handleNavigation(navigationOptions);
        expect(navigateSpy).toHaveBeenCalledWith(
          '/signin_token_code?authStateMachine=true',
          expect.anything()
        );
      });

      it('TOTP account whose response echoes email-otp still routes to /signin_totp_code (live-fact safety net)', async () => {
        // The machine reads accountHasTotp (a live fact) rather than trusting the
        // verificationMethod echoed by the server response. Legacy getUnverifiedNavigationTarget
        // only checks verificationMethod === TOTP_2FA, so it would send this to
        // /signin_token_code — this test fails without the machine branch.
        const navigationOptions = createBaseNavigationOptions({
          integration: createMockSigninWebIntegration(),
          queryParams: '?authStateMachine=true',
          accountHasTotp: true,
          signinData: {
            uid: MOCK_UID,
            sessionToken: MOCK_SESSION_TOKEN,
            keyFetchToken: MOCK_KEY_FETCH_TOKEN,
            emailVerified: true,
            sessionVerified: false,
            verificationMethod: VerificationMethods.EMAIL_OTP,
            verificationReason: VerificationReasons.SIGN_IN,
          },
        });
        await handleNavigation(navigationOptions);
        expect(navigateSpy).toHaveBeenCalledWith(
          '/signin_totp_code?authStateMachine=true',
          expect.anything()
        );
      });

      it('falls through to legacy navigation when isSessionAALUpgrade is true (machine excluded)', async () => {
        // The guard excludes AAL upgrades. Legacy routes bare to /settings with no query string.
        // If the machine had wrongly fired it would have appended ?authStateMachine=true.
        const navigationOptions = createBaseNavigationOptions({
          integration: createMockSigninWebIntegration(),
          queryParams: '?authStateMachine=true',
          isSessionAALUpgrade: true,
          signinData: {
            uid: MOCK_UID,
            sessionToken: MOCK_SESSION_TOKEN,
            keyFetchToken: MOCK_KEY_FETCH_TOKEN,
            emailVerified: true,
            sessionVerified: true,
            verificationMethod: VerificationMethods.EMAIL,
            verificationReason: VerificationReasons.SIGN_IN,
          },
        });
        await handleNavigation(navigationOptions);
        expect(navigateSpy).toHaveBeenCalledWith('/settings');
      });

      it('falls through to legacy navigation when ?authStateMachine=false overrides a config-enabled flag', async () => {
        // URL forces the machine OFF even though the config flag is on.
        // Legacy plain-web nav goes to /settings without the query param appended
        // (the machine never runs so it cannot produce a machine-style URL).
        const navigationOptions = createBaseNavigationOptions({
          integration: createMockSigninWebIntegration(),
          queryParams: '?authStateMachine=false',
          signinData: {
            uid: MOCK_UID,
            sessionToken: MOCK_SESSION_TOKEN,
            keyFetchToken: MOCK_KEY_FETCH_TOKEN,
            emailVerified: true,
            sessionVerified: true,
            verificationMethod: VerificationMethods.EMAIL,
            verificationReason: VerificationReasons.SIGN_IN,
          },
        });
        await handleNavigation(navigationOptions);
        // Legacy non-OAuth path navigates to /settings (no machine-suffixed URL).
        expect(navigateSpy).toHaveBeenCalledWith(
          '/settings',
          expect.anything()
        );
        // The machine would have produced '/settings?authStateMachine=false'; confirm it did not.
        expect(navigateSpy).not.toHaveBeenCalledWith(
          '/settings?authStateMachine=false',
          expect.anything()
        );
      });

      it('routes via machine when config flag is on and no authStateMachine query param is present', async () => {
        // config.featureFlags.authStateMachine is set to true for this test only.
        config.featureFlags!.authStateMachine = true;
        const navigationOptions = createBaseNavigationOptions({
          integration: createMockSigninWebIntegration(),
          queryParams: '',
          signinData: {
            uid: MOCK_UID,
            sessionToken: MOCK_SESSION_TOKEN,
            keyFetchToken: MOCK_KEY_FETCH_TOKEN,
            emailVerified: true,
            sessionVerified: true,
            verificationMethod: VerificationMethods.EMAIL,
            verificationReason: VerificationReasons.SIGN_IN,
          },
        });
        await handleNavigation(navigationOptions);
        // Machine produces '/settings' + queryParams (empty string here) via routeFor.
        expect(navigateSpy).toHaveBeenCalledWith(
          '/settings',
          expect.anything()
        );
        config.featureFlags!.authStateMachine = false;
      });
    });

    describe('auth state machine routing (flag on, Sync)', () => {
      // Mirrors the legacy Sync mock above: a Web integration flipped to Sync.
      // getWebChannelServices is overridden so the fxaLogin `services` payload is
      // observable in the parity assertions.
      const createSyncIntegration = () => ({
        ...createMockSigninWebIntegration(),
        isSync: () => true,
        wantsKeys: () => true,
        getWebChannelServices: () => ({ sync: {} }),
      });

      // Captures the navigate destination + fxaLogin payload for one input under
      // a given flag value, so the machine-on result can be asserted equal to the
      // legacy (flag-off) result for the same Sync input.
      const runSync = async (
        flag: 'true' | 'false',
        overrides: Partial<NavigationOptions>
      ) => {
        jest.clearAllMocks();
        const navigationOptions = createBaseNavigationOptions({
          integration: createSyncIntegration(),
          queryParams: `?authStateMachine=${flag}&service=sync`,
          handleFxaLogin: true,
          ...overrides,
        });
        await handleNavigation(navigationOptions);
        const navCall = navigateSpy.mock.calls[0] as unknown as
          | [string, { state?: unknown; replace?: boolean }?]
          | undefined;
        return {
          navTo: navCall?.[0],
          navState: navCall?.[1],
          fxaLogin: fxaLoginSpy.mock.calls[0]?.[0],
        };
      };

      const unverified: Partial<NavigationOptions> = {
        signinData: {
          uid: MOCK_UID,
          sessionToken: MOCK_SESSION_TOKEN,
          keyFetchToken: MOCK_KEY_FETCH_TOKEN,
          emailVerified: true,
          sessionVerified: false,
          verificationMethod: VerificationMethods.EMAIL_OTP,
          verificationReason: VerificationReasons.SIGN_IN,
        },
      };
      const verified: Partial<NavigationOptions> = {
        signinData: {
          uid: MOCK_UID,
          sessionToken: MOCK_SESSION_TOKEN,
          keyFetchToken: MOCK_KEY_FETCH_TOKEN,
          emailVerified: true,
          sessionVerified: true,
          verificationMethod: VerificationMethods.EMAIL,
          verificationReason: VerificationReasons.SIGN_IN,
        },
      };

      it('fires fxaLogin with verified:false and navigates to /signin_token_code for an unverified Sync sign-in', async () => {
        const { navTo, fxaLogin } = await runSync('true', unverified);
        expect(fxaLogin).toEqual(
          expect.objectContaining({ verified: false, services: { sync: {} } })
        );
        expect(navTo).toBe(
          '/signin_token_code?authStateMachine=true&service=sync'
        );
      });

      it('fires fxaLogin with verified:true and routes through getSyncNavigate to /pair for a verified Sync sign-in', async () => {
        const { navTo, navState, fxaLogin } = await runSync('true', verified);
        expect(fxaLogin).toEqual(
          expect.objectContaining({ verified: true, services: { sync: {} } })
        );
        expect(navTo).toBe('/pair?authStateMachine=true&service=sync');
        expect(
          (navState as unknown as { state: { origin: string } }).state.origin
        ).toBe('signin');
      });

      it('routes a verified Sync sign-in with showInlineRecoveryKeySetup to /inline_recovery_key_setup', async () => {
        const { navTo, fxaLogin } = await runSync('true', {
          ...verified,
          showInlineRecoveryKeySetup: true,
        });
        expect(fxaLogin).toEqual(expect.objectContaining({ verified: true }));
        expect(navTo).toBe(
          '/inline_recovery_key_setup?authStateMachine=true&service=sync'
        );
      });

      // #1: a send-tab entrypoint forces showInlineRecoveryKeySetup false, so even
      // with the flag set the destination is /pair, not /inline_recovery_key_setup.
      // The mutation runs ahead of the machine branch, so machine-on matches flag-off.
      it('clears showInlineRecoveryKeySetup for a verified send-tab Sync sign-in and routes to /pair', async () => {
        const sendTabIntegration = () => {
          const i = createSyncIntegration();
          i.data.entrypoint = 'send-tab-toolbar-icon';
          return i;
        };
        const runSendTab = async (flag: 'true' | 'false') => {
          jest.clearAllMocks();
          await handleNavigation(
            createBaseNavigationOptions({
              integration: sendTabIntegration(),
              queryParams: `?authStateMachine=${flag}&service=sync`,
              handleFxaLogin: true,
              ...verified,
              showInlineRecoveryKeySetup: true,
            })
          );
          return navigateSpy.mock.calls[0]?.[0] as unknown as
            | string
            | undefined;
        };
        const on = await runSendTab('true');
        const off = await runSendTab('false');
        expect(on).toContain('/pair?');
        expect(on).not.toContain('inline_recovery_key');
        expect(
          on?.replace('authStateMachine=true', 'authStateMachine=false')
        ).toBe(off);
      });

      // #2: verified Sync + performNavigation:false must not navigate, but fxaLogin
      // still fires (legacy fires it before the performNavigation guard).
      it('does not navigate a verified Sync sign-in when performNavigation is false, but still fires fxaLogin', async () => {
        const runNoNav = async (flag: 'true' | 'false') => {
          jest.clearAllMocks();
          await handleNavigation(
            createBaseNavigationOptions({
              integration: createSyncIntegration(),
              queryParams: `?authStateMachine=${flag}&service=sync`,
              handleFxaLogin: true,
              performNavigation: false,
              ...verified,
            })
          );
          return {
            navCount: navigateSpy.mock.calls.length,
            fxaLogin: fxaLoginSpy.mock.calls[0]?.[0],
          };
        };
        const on = await runNoNav('true');
        const off = await runNoNav('false');
        expect(on.navCount).toBe(0);
        expect(on.navCount).toBe(off.navCount);
        expect(on.fxaLogin).toEqual(
          expect.objectContaining({ verified: true })
        );
        expect(on.fxaLogin).toEqual(off.fxaLogin);
      });

      // #3: unverified Firefox-non-sync that does not want keys, with a non-mustVerify
      // reason and performNavigation:false, must not navigate — matching legacy's
      // performNavigation !== false gate.
      it('does not navigate an unverified Firefox-non-sync sign-in when performNavigation is false and the case is not mustVerify', async () => {
        const firefoxNonSyncIntegration = () => ({
          ...createMockSigninWebIntegration(),
          isSync: () => false,
          isFirefoxNonSync: () => true,
          wantsKeys: () => false,
          getWebChannelServices: () => ({ sync: {} }),
        });
        const runNoNav = async (flag: 'true' | 'false') => {
          jest.clearAllMocks();
          await handleNavigation(
            createBaseNavigationOptions({
              integration: firefoxNonSyncIntegration(),
              queryParams: `?authStateMachine=${flag}`,
              handleFxaLogin: true,
              performNavigation: false,
              signinData: {
                uid: MOCK_UID,
                sessionToken: MOCK_SESSION_TOKEN,
                keyFetchToken: MOCK_KEY_FETCH_TOKEN,
                emailVerified: true,
                sessionVerified: false,
                verificationMethod: VerificationMethods.EMAIL_OTP,
                verificationReason: VerificationReasons.SIGN_IN,
              },
            })
          );
          return navigateSpy.mock.calls.length;
        };
        const on = await runNoNav('true');
        const off = await runNoNav('false');
        expect(on).toBe(0);
        expect(on).toBe(off);
      });

      // #5: SIGN_UP with emailVerified:true falls through to legacy, which routes to
      // /confirm_signup_code (legacy returns it for SIGN_UP independent of emailVerified).
      it('routes a SIGN_UP Sync sign-in with emailVerified true to /confirm_signup_code via legacy fall-through', async () => {
        const signUpVerifiedEmail: Partial<NavigationOptions> = {
          signinData: {
            uid: MOCK_UID,
            sessionToken: MOCK_SESSION_TOKEN,
            keyFetchToken: MOCK_KEY_FETCH_TOKEN,
            emailVerified: true,
            sessionVerified: false,
            verificationMethod: VerificationMethods.EMAIL_OTP,
            verificationReason: VerificationReasons.SIGN_UP,
          },
        };
        const on = await runSync('true', signUpVerifiedEmail);
        const off = await runSync('false', signUpVerifiedEmail);
        expect(on.navTo).toContain('/confirm_signup_code');
        expect(
          on.navTo?.replace('authStateMachine=true', 'authStateMachine=false')
        ).toBe(off.navTo);
      });

      // #4 (ACCEPTED divergence, documented): the machine routes an unverified
      // EMAIL_OTP sign-in to /signin_totp_code when the live account has TOTP, and
      // skips fxaLogin. Legacy would send EMAIL_OTP to /signin_token_code. This is
      // the one intentional, safer divergence (the R-18 live-TOTP safety net): it
      // avoids prompting for an email code on an account that actually has 2FA, and
      // avoids the double `verified: false` message before TOTP. It is therefore
      // excluded from the parity gate above.
      it('routes an unverified EMAIL_OTP Sync sign-in to /signin_totp_code (and skips fxaLogin) when the live account has TOTP — intended safer divergence from legacy', async () => {
        const { navTo, fxaLogin } = await runSync('true', {
          ...unverified,
          accountHasTotp: true,
        });
        expect(navTo).toBe(
          '/signin_totp_code?authStateMachine=true&service=sync'
        );
        expect(fxaLogin).toBeUndefined();
      });

      // Parity gate: for each Sync input the machine-on destination and the
      // fxaLogin payload must equal the legacy (flag-off) result. The only
      // expected difference is the authStateMachine query value baked into the URL.
      // accountHasTotp is deliberately excluded: it is the documented exception above.
      it.each([
        { name: 'unverified email-otp', overrides: unverified },
        { name: 'verified default', overrides: verified },
        {
          name: 'verified with inline recovery key setup',
          overrides: { ...verified, showInlineRecoveryKeySetup: true },
        },
      ])(
        'machine-on destination and fxaLogin equal legacy for $name Sync',
        async ({ overrides }) => {
          const on = await runSync('true', overrides);
          const off = await runSync('false', overrides);
          const normalize = (url?: string) =>
            url?.replace('authStateMachine=false', 'authStateMachine=true');
          expect(normalize(on.navTo)).toBe(normalize(off.navTo));
          expect(on.fxaLogin).toEqual(off.fxaLogin);
        }
      );
    });

    describe('auth state machine routing (flag on, OAuth web)', () => {
      // OAuth web is an RP (relying-party) integration: not web-channel, so no
      // sendFxaLogin and no firefox.fxaOAuthLogin. It resolves the destination
      // through getOAuthNavigationTarget (finishOAuthFlowHandler -> RP redirect).
      // Each case asserts machine-on (flag true) == legacy (flag off) for the
      // same input, the one allowed difference being the authStateMachine query
      // value baked into a URL.
      const fxaOAuthLoginSpy = jest.spyOn(firefox, 'fxaOAuthLogin');

      const verifiedSignin = {
        uid: MOCK_UID,
        sessionToken: MOCK_SESSION_TOKEN,
        keyFetchToken: MOCK_KEY_FETCH_TOKEN,
        emailVerified: true,
        sessionVerified: true,
        verificationMethod: VerificationMethods.EMAIL,
        verificationReason: VerificationReasons.SIGN_IN,
      };
      const unverifiedSignin = {
        uid: MOCK_UID,
        sessionToken: MOCK_SESSION_TOKEN,
        keyFetchToken: MOCK_KEY_FETCH_TOKEN,
        emailVerified: true,
        sessionVerified: false,
        verificationMethod: VerificationMethods.EMAIL_OTP,
        verificationReason: VerificationReasons.SIGN_IN,
      };

      // Runs handleNavigation for one OAuth-web input under a given flag value,
      // capturing every observable side effect so machine-on can be asserted
      // equal to legacy for the same input. The integration factory is a thunk
      // so each run gets a fresh mock (jest.clearAllMocks resets call history,
      // not the integration object).
      const run = async (
        flag: 'true' | 'false',
        integrationFactory: () => SigninIntegration,
        overrides: Partial<NavigationOptions> = {}
      ) => {
        jest.clearAllMocks();
        const navigationOptions = createBaseNavigationOptions({
          integration: integrationFactory(),
          queryParams: `?authStateMachine=${flag}&client_id=abc`,
          ...overrides,
        });
        const result = await handleNavigation(navigationOptions);
        return {
          error: result.error,
          navCall: navigateSpy.mock.calls[0] as unknown as
            | [string, { state?: unknown; replace?: boolean }?]
            | undefined,
          hardNavCall: hardNavigateSpy.mock.calls[0],
          fxaOAuthLoginCalls: fxaOAuthLoginSpy.mock.calls.length,
          fxaLoginCalls: fxaLoginSpy.mock.calls.length,
        };
      };

      it('redirects a verified OAuth web sign-in to the RP via hardNavigate (machine-on == legacy)', async () => {
        const factory = () => createMockSigninOAuthIntegration();
        const on = await run('true', factory, { signinData: verifiedSignin });
        const off = await run('false', factory, { signinData: verifiedSignin });

        expect(on.error).toBeUndefined();
        expect(on.hardNavCall).toEqual([
          MOCK_OAUTH_FLOW_HANDLER_RESPONSE.redirect,
          undefined,
          undefined,
          true,
        ]);
        expect(on.hardNavCall).toEqual(off.hardNavCall);
        // OAuth web must never reach the native browser-message path.
        expect(on.fxaOAuthLoginCalls).toBe(0);
        expect(on.fxaLoginCalls).toBe(0);
      });

      it('diverts a verified AAL2 OAuth web RP with no account TOTP to /inline_totp_setup (machine-on == legacy)', async () => {
        const factory = () => {
          const integration = createMockSigninOAuthIntegration();
          integration.wantsTwoStepAuthentication = jest
            .fn()
            .mockReturnValue(true);
          return integration;
        };
        const overrides: Partial<NavigationOptions> = {
          accountHasTotp: false,
          // finishOAuthFlowHandler must not run when the AAL2 guard diverts.
          finishOAuthFlowHandler: jest.fn(),
          signinData: verifiedSignin,
        };
        const on = await run('true', factory, overrides);
        const off = await run('false', factory, overrides);

        expect(on.error).toBeUndefined();
        expect(on.navCall?.[0]).toBe(
          '/inline_totp_setup?authStateMachine=true&client_id=abc'
        );
        expect((on.navCall?.[1] as { replace?: boolean })?.replace).toBe(true);
        expect(on.navCall?.[0]?.replace('=true', '=false')).toBe(
          off.navCall?.[0]
        );
        expect(on.fxaOAuthLoginCalls).toBe(0);
      });

      it('diverts a verified third-party-auth OAuth web sign-in that requires a password to /post_verify/set_password (machine-on == legacy)', async () => {
        const factory = () => {
          const integration = createMockSigninOAuthIntegration();
          // requiresPasswordForLogin returns true via wantsKeysIfPasswordEntered
          // when keys are not optional.
          integration.wantsKeysIfPasswordEntered = () => true;
          return integration;
        };
        const overrides: Partial<NavigationOptions> = {
          isSignInWithThirdPartyAuth: true,
          supportsKeysOptionalLogin: false,
          finishOAuthFlowHandler: jest.fn(),
          signinData: verifiedSignin,
        };
        const on = await run('true', factory, overrides);
        const off = await run('false', factory, overrides);

        expect(on.error).toBeUndefined();
        expect(on.navCall?.[0]).toContain('/post_verify/set_password');
        expect(
          (
            on.navCall?.[1] as {
              state?: { passwordCreationReason?: string };
            }
          )?.state?.passwordCreationReason
        ).toBe('third_party_auth');
        expect(on.navCall?.[0]?.replace('=true', '=false')).toBe(
          off.navCall?.[0]
        );
      });

      it('propagates the error and does not navigate when getOAuthNavigationTarget returns an error (machine-on == legacy)', async () => {
        const factory = () => createMockSigninOAuthIntegration();
        const overrides: Partial<NavigationOptions> = {
          signinData: verifiedSignin,
          finishOAuthFlowHandler: jest.fn().mockResolvedValue({
            error: AuthUiErrors.BACKEND_SERVICE_FAILURE,
          }),
        };
        const on = await run('true', factory, overrides);
        const off = await run('false', factory, overrides);

        expect(on.error).toBe(AuthUiErrors.BACKEND_SERVICE_FAILURE);
        expect(on.error).toBe(off.error);
        expect(on.navCall).toBeUndefined();
        expect(on.hardNavCall).toBeUndefined();
      });

      it('routes an unverified OAuth web mustVerify (wantsKeys) sign-in to the verify route (machine-on == legacy)', async () => {
        const factory = () => {
          const integration = createMockSigninOAuthIntegration();
          (integration as { wantsKeys: () => boolean }).wantsKeys = () => true;
          return integration;
        };
        const overrides: Partial<NavigationOptions> = {
          signinData: unverifiedSignin,
        };
        const on = await run('true', factory, overrides);
        const off = await run('false', factory, overrides);

        expect(on.error).toBeUndefined();
        expect(on.navCall?.[0]).toBe(
          '/signin_token_code?authStateMachine=true&client_id=abc'
        );
        expect(on.navCall?.[0]?.replace('=true', '=false')).toBe(
          off.navCall?.[0]
        );
      });

      it('takes an unverified non-mustVerify OAuth web sign-in onward via getOAuthNavigationTarget type-C (machine-on == legacy)', async () => {
        const factory = () => createMockSigninOAuthIntegration();
        const overrides: Partial<NavigationOptions> = {
          signinData: unverifiedSignin,
        };
        const on = await run('true', factory, overrides);
        const off = await run('false', factory, overrides);

        expect(on.error).toBeUndefined();
        // type-C: skip verification, hard-navigate to the RP redirect.
        expect(on.hardNavCall).toEqual([
          MOCK_OAUTH_FLOW_HANDLER_RESPONSE.redirect,
          undefined,
          undefined,
          true,
        ]);
        expect(on.hardNavCall).toEqual(off.hardNavCall);
        expect(on.fxaOAuthLoginCalls).toBe(0);
      });
    });

    describe('auth state machine routing (flag on, OAuth native)', () => {
      // OAuth native (Sync desktop/mobile, Firefox-non-sync) is BOTH OAuth and
      // web-channel for Sync, so both sendFxaLogin (fxa_login) and
      // firefox.fxaOAuthLogin fire. The destination resolves through
      // getOAuthNavigationTarget. Each case asserts machine-on (flag true) ==
      // legacy (flag off) for the same input: same destination, same
      // fxaOAuthLogin payload, same fxaLogin call count. The one allowed
      // difference is the authStateMachine query value baked into a URL.
      const fxaOAuthLoginSpy = jest.spyOn(firefox, 'fxaOAuthLogin');

      const verifiedSignin = {
        uid: MOCK_UID,
        sessionToken: MOCK_SESSION_TOKEN,
        keyFetchToken: MOCK_KEY_FETCH_TOKEN,
        emailVerified: true,
        sessionVerified: true,
        verificationMethod: VerificationMethods.EMAIL,
        verificationReason: VerificationReasons.SIGN_IN,
      };
      const unverifiedSignin = {
        uid: MOCK_UID,
        sessionToken: MOCK_SESSION_TOKEN,
        keyFetchToken: MOCK_KEY_FETCH_TOKEN,
        emailVerified: true,
        sessionVerified: false,
        verificationMethod: VerificationMethods.EMAIL_OTP,
        verificationReason: VerificationReasons.SIGN_IN,
      };

      // Runs handleNavigation for one OAuth-native input under a given flag value,
      // capturing every observable side effect so machine-on can be asserted
      // equal to legacy for the same input. The integration factory is a thunk so
      // each run gets a fresh mock (jest.clearAllMocks resets call history, not
      // the integration object).
      const run = async (
        flag: 'true' | 'false',
        integrationFactory: () => SigninIntegration,
        overrides: Partial<NavigationOptions> = {}
      ) => {
        jest.clearAllMocks();
        const navigationOptions = createBaseNavigationOptions({
          integration: integrationFactory(),
          queryParams: `?authStateMachine=${flag}&service=sync`,
          handleFxaLogin: true,
          handleFxaOAuthLogin: true,
          ...overrides,
        });
        const result = await handleNavigation(navigationOptions);
        return {
          error: result.error,
          navCall: navigateSpy.mock.calls[0] as unknown as
            | [string, { state?: unknown; replace?: boolean }?]
            | undefined,
          hardNavCall: hardNavigateSpy.mock.calls[0],
          fxaOAuthLoginCall: fxaOAuthLoginSpy.mock.calls[0]?.[0],
          fxaOAuthLoginCalls: fxaOAuthLoginSpy.mock.calls.length,
          fxaLoginCall: fxaLoginSpy.mock.calls[0]?.[0],
          fxaLoginCalls: fxaLoginSpy.mock.calls.length,
        };
      };

      it('fires fxaLogin then fxaOAuthLogin and routes a verified native Sync sign-in to /pair (machine-on == legacy)', async () => {
        const factory = () => createMockSigninOAuthNativeSyncIntegration();
        const on = await run('true', factory, { signinData: verifiedSignin });
        const off = await run('false', factory, { signinData: verifiedSignin });

        expect(on.error).toBeUndefined();
        // Both browser messages fire for native Sync.
        expect(on.fxaLoginCalls).toBe(1);
        expect(on.fxaLoginCall).toEqual(
          expect.objectContaining({ verified: true })
        );
        expect(on.fxaOAuthLoginCalls).toBe(1);
        expect(on.fxaOAuthLoginCall).toEqual({
          action: 'signin',
          code: MOCK_OAUTH_FLOW_HANDLER_RESPONSE.code,
          redirect: MOCK_OAUTH_FLOW_HANDLER_RESPONSE.redirect,
          state: MOCK_OAUTH_FLOW_HANDLER_RESPONSE.state,
          scope: MOCK_OAUTH_FLOW_HANDLER_RESPONSE.scope,
        });
        expect(on.navCall?.[0]).toBe(
          '/pair?authStateMachine=true&service=sync'
        );
        expect(
          (on.navCall?.[1] as { state?: { origin?: string } })?.state?.origin
        ).toBe('signin');
        expect(on.navCall?.[0]?.replace('=true', '=false')).toBe(
          off.navCall?.[0]
        );
        expect(on.fxaOAuthLoginCall).toEqual(off.fxaOAuthLoginCall);
        expect(on.fxaLoginCalls).toBe(off.fxaLoginCalls);
      });

      it('routes a verified Firefox-non-sync VPN native sign-in to /post_verify/service_welcome via navigate (machine-on == legacy)', async () => {
        const factory = () =>
          createMockSigninOAuthNativeIntegration({
            isSync: false,
            service: OAuthNativeServices.Vpn,
          });
        const on = await run('true', factory, { signinData: verifiedSignin });
        const off = await run('false', factory, { signinData: verifiedSignin });

        expect(on.error).toBeUndefined();
        expect(on.fxaOAuthLoginCalls).toBe(1);
        expect(on.navCall).toEqual([
          '/post_verify/service_welcome',
          { state: { origin: 'signin' }, replace: true },
        ]);
        expect(on.navCall).toEqual(off.navCall);
        expect(on.fxaOAuthLoginCall).toEqual(off.fxaOAuthLoginCall);
      });

      it('routes a verified Firefox-non-sync non-VPN native sign-in to /settings (machine-on == legacy)', async () => {
        const factory = () => {
          const integration = createMockSigninOAuthNativeIntegration({
            isSync: false,
            service: OAuthNativeServices.Relay,
          });
          // A non-Sync service that does not request keys signs in directly.
          integration.wantsKeysIfPasswordEntered = () => false;
          return integration;
        };
        const on = await run('true', factory, { signinData: verifiedSignin });
        const off = await run('false', factory, { signinData: verifiedSignin });

        expect(on.error).toBeUndefined();
        expect(on.fxaOAuthLoginCalls).toBe(1);
        expect(on.navCall).toEqual(['/settings', { replace: true }]);
        expect(on.navCall).toEqual(off.navCall);
        expect(on.fxaOAuthLoginCall).toEqual(off.fxaOAuthLoginCall);
      });

      it('defers fxaOAuthLogin and routes a verified third-party-auth native sign-in that requires a password to /post_verify/set_password (machine-on == legacy)', async () => {
        const factory = () =>
          createMockSigninOAuthNativeIntegration({
            isSync: false,
            service: OAuthNativeServices.Vpn,
          });
        const overrides: Partial<NavigationOptions> = {
          isSignInWithThirdPartyAuth: true,
          supportsKeysOptionalLogin: false,
          // finishOAuthFlowHandler must not run when set_password diverts, so
          // no oauthData is produced and fxaOAuthLogin must not fire.
          finishOAuthFlowHandler: jest.fn(),
          signinData: verifiedSignin,
        };
        const on = await run('true', factory, overrides);
        const off = await run('false', factory, overrides);

        expect(on.error).toBeUndefined();
        expect(on.fxaOAuthLoginCalls).toBe(0);
        expect(on.navCall?.[0]).toContain('/post_verify/set_password');
        expect(
          (
            on.navCall?.[1] as {
              state?: { passwordCreationReason?: string };
            }
          )?.state?.passwordCreationReason
        ).toBe('third_party_auth');
        expect(on.navCall?.[0]?.replace('=true', '=false')).toBe(
          off.navCall?.[0]
        );
        expect(on.fxaOAuthLoginCalls).toBe(off.fxaOAuthLoginCalls);
      });

      it('propagates the error and does not navigate or fire fxaOAuthLogin when getOAuthNavigationTarget returns an error (machine-on == legacy)', async () => {
        const factory = () => createMockSigninOAuthNativeSyncIntegration();
        const overrides: Partial<NavigationOptions> = {
          signinData: verifiedSignin,
          finishOAuthFlowHandler: jest.fn().mockResolvedValue({
            error: AuthUiErrors.BACKEND_SERVICE_FAILURE,
          }),
        };
        const on = await run('true', factory, overrides);
        const off = await run('false', factory, overrides);

        expect(on.error).toBe(AuthUiErrors.BACKEND_SERVICE_FAILURE);
        expect(on.error).toBe(off.error);
        expect(on.navCall).toBeUndefined();
        expect(on.hardNavCall).toBeUndefined();
        expect(on.fxaOAuthLoginCalls).toBe(0);
        expect(on.fxaOAuthLoginCalls).toBe(off.fxaOAuthLoginCalls);
      });

      it('fires fxaLogin with verified:false and routes an unverified native Sync sign-in to the verify route (machine-on == legacy)', async () => {
        const factory = () => createMockSigninOAuthNativeSyncIntegration();
        const on = await run('true', factory, { signinData: unverifiedSignin });
        const off = await run('false', factory, {
          signinData: unverifiedSignin,
        });

        expect(on.error).toBeUndefined();
        expect(on.fxaLoginCalls).toBe(1);
        expect(on.fxaLoginCall).toEqual(
          expect.objectContaining({ verified: false })
        );
        // Unverified native does not resolve OAuth, so no fxaOAuthLogin.
        expect(on.fxaOAuthLoginCalls).toBe(0);
        expect(on.navCall?.[0]).toBe(
          '/signin_token_code?authStateMachine=true&service=sync'
        );
        expect(on.navCall?.[0]?.replace('=true', '=false')).toBe(
          off.navCall?.[0]
        );
        expect(on.fxaLoginCalls).toBe(off.fxaLoginCalls);
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
    it('returns /post_verify/set_password with explicit passwordCreationReason when isSignInWithThirdPartyAuth is true', () => {
      const result = getSyncNavigate('?service=sync', {
        isSignInWithThirdPartyAuth: true,
      });
      expect(result.to).toContain('/post_verify/set_password?');
      expect(result.locationState).toEqual({
        passwordCreationReason: 'third_party_auth',
      });
    });

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
});
