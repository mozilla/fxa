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
import { NavigationOptions } from './interfaces';
import {
  createMockSigninOAuthNativeSyncIntegration,
  createMockSigninOAuthNativeIntegration,
  createMockSigninOAuthIntegration,
} from './mocks';
import { handleNavigation } from './utils';
import * as ReachRouter from '@reach/router';
import * as ReactUtils from 'fxa-react/lib/utils';
import firefox from '../../lib/channels/firefox';
import { OAuthNativeServices } from '../../models';

jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  navigate: jest.fn(),
}));

jest.mock('../../lib/channels/firefox', () => ({
  __esModule: true,
  default: {
    fxaLogin: jest.fn(),
    fxaOAuthLogin: jest.fn(),
  },
}));

const navigateSpy = jest.spyOn(ReachRouter, 'navigate');
const hardNavigateSpy = jest.spyOn(ReactUtils, 'hardNavigate');
const fxaLoginSpy = jest.spyOn(firefox, 'fxaLogin');

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

    it('sends fxaLogin with aimode services and navigates to settings for OAuthNative service=aimode', async () => {
      const navigationOptions = createBaseNavigationOptions({
        integration: createMockSigninOAuthNativeIntegration({
          isSync: false,
          service: 'aimode',
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
        services: { aimode: {} },
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
        (mockOAuthIntegration as any).wantsKeys = jest
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

      it('does not send fxaLogin for TOTP verification', async () => {
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
    });
  });
});
