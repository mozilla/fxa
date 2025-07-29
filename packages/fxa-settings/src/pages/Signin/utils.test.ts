/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { InMemoryCache } from '@apollo/client';
import * as ReachRouter from '@reach/router';
import * as ReactUtils from 'fxa-react/lib/utils';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { currentAccount, discardSessionToken } from '../../lib/cache';
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
import { createMockSigninOAuthNativeSyncIntegration } from './mocks';
import { handleNavigation, cachedSignIn } from './utils';

// Mock dependencies
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  navigate: jest.fn(),
}));

jest.mock('../../lib/cache', () => ({
  currentAccount: jest.fn(),
  discardSessionToken: jest.fn(),
  consumeAlertTextExternal: jest.fn().mockReturnValue(null),
}));

const navigateSpy = jest.spyOn(ReachRouter, 'navigate');
const hardNavigateSpy = jest.spyOn(ReactUtils, 'hardNavigate');

const mockCurrentAccount = currentAccount as jest.MockedFunction<
  typeof currentAccount
>;
const mockDiscardSessionToken = discardSessionToken as jest.MockedFunction<
  typeof discardSessionToken
>;

describe('Signin utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleNavigation', () => {
    it('does not navigate if performNavigation is false', async () => {
      const navigationOptions = {
        email: MOCK_EMAIL,
        signinData: {
          uid: MOCK_UID,
          sessionToken: MOCK_SESSION_TOKEN,
          verified: true,
          verificationMethod: VerificationMethods.EMAIL,
          verificationReason: VerificationReasons.SIGN_IN,
          keyFetchToken: MOCK_KEY_FETCH_TOKEN,
        },
        integration: createMockSigninOAuthNativeSyncIntegration({
          isMobile: true,
        }),
        redirectTo: '',
        finishOAuthFlowHandler: jest
          .fn()
          .mockReturnValue(MOCK_OAUTH_FLOW_HANDLER_RESPONSE),
        queryParams: '',
        performNavigation: false,
      } as NavigationOptions;
      const { error } = await handleNavigation(navigationOptions);

      expect(error).toBeUndefined();
      expect(navigateSpy).not.toHaveBeenCalled();
      expect(hardNavigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('cachedSignIn function', () => {
    let mockAuthClient: any;
    let mockCache: InMemoryCache;
    let mockSession: any;
    const mockSessionToken = MOCK_SESSION_TOKEN;
    const mockStoredAccount = { uid: MOCK_UID };

    beforeEach(() => {
      jest.clearAllMocks();

      mockCurrentAccount.mockReturnValue(mockStoredAccount);

      mockAuthClient = {
        sessionVerificationStatus: jest.fn(),
      };

      mockCache = new InMemoryCache();
      mockCache.identify = jest.fn().mockReturnValue(`Account:${MOCK_UID}`);
      mockCache.modify = jest.fn();

      mockSession = {
        sendVerificationCode: jest.fn(),
      };
    });

    describe('successful cached signin scenarios', () => {
      it('should handle verified user with no verification needed', async () => {
        mockAuthClient.sessionVerificationStatus.mockResolvedValue({
          accountStatus: 'verified',
          sessionStatus: 'verified',
          verificationMethod: undefined,
        });

        const result = await cachedSignIn(
          mockSessionToken,
          mockAuthClient,
          mockCache,
          mockSession
        );

        expect(result.data).toEqual({
          verificationMethod: undefined,
          verificonationReason: undefined,
          verified: true,
          uid: MOCK_UID,
          sessionVerified: true,
          emailVerified: true,
        });
        expect(result.error).toBeUndefined();
        expect(mockSession.sendVerificationCode).not.toHaveBeenCalled();
        expect(mockCache.modify).not.toHaveBeenCalled();
      });

      it('should handle TOTP 2FA verification', async () => {
        mockAuthClient.sessionVerificationStatus.mockResolvedValue({
          accountStatus: 'verified',
          sessionStatus: 'mustVerify',
          verificationMethod: 'totp-2fa',
        });

        const result = await cachedSignIn(
          mockSessionToken,
          mockAuthClient,
          mockCache,
          mockSession
        );

        expect(result.data).toEqual({
          verificationMethod: VerificationMethods.TOTP_2FA,
          verificationReason: VerificationReasons.SIGN_IN,
          verified: false,
          uid: MOCK_UID,
          sessionVerified: false,
          emailVerified: true,
        });
        expect(mockCache.modify).toHaveBeenCalledWith({
          id: `Account:${MOCK_UID}`,
          fields: {
            totp: expect.any(Function),
          },
        });
        expect(mockSession.sendVerificationCode).not.toHaveBeenCalled();
      });

      it('should handle email OTP verification for sign-in', async () => {
        mockAuthClient.sessionVerificationStatus.mockResolvedValue({
          accountStatus: 'verified',
          sessionStatus: 'mustVerify',
          verificationMethod: 'email-otp',
        });

        const result = await cachedSignIn(
          mockSessionToken,
          mockAuthClient,
          mockCache,
          mockSession
        );

        expect(result.data).toEqual({
          verificationMethod: VerificationMethods.EMAIL_OTP,
          verificationReason: VerificationReasons.SIGN_IN,
          verified: false,
          uid: MOCK_UID,
          sessionVerified: false,
          emailVerified: true,
        });
        expect(mockSession.sendVerificationCode).toHaveBeenCalled();
        expect(mockCache.modify).not.toHaveBeenCalled();
      });

      it('should handle email OTP verification for sign-up', async () => {
        mockAuthClient.sessionVerificationStatus.mockResolvedValue({
          accountStatus: 'unverified',
          sessionStatus: 'mustVerify',
          verificationMethod: 'email-otp',
        });

        const result = await cachedSignIn(
          mockSessionToken,
          mockAuthClient,
          mockCache,
          mockSession
        );

        expect(result.data).toEqual({
          verificationMethod: VerificationMethods.EMAIL_OTP,
          verificationReason: VerificationReasons.SIGN_UP,
          verified: false,
          uid: MOCK_UID,
          sessionVerified: false,
          emailVerified: false,
        });
        expect(mockSession.sendVerificationCode).toHaveBeenCalled();
        expect(mockCache.modify).not.toHaveBeenCalled();
      });
    });

    describe('error handling scenarios', () => {
      it('should handle INVALID_TOKEN error returned from auth server', async () => {
        mockAuthClient.sessionVerificationStatus.mockRejectedValue(
          AuthUiErrors.INVALID_TOKEN
        );

        const result = await cachedSignIn(
          mockSessionToken,
          mockAuthClient,
          mockCache,
          mockSession
        );

        expect(mockDiscardSessionToken).toHaveBeenCalled();
        // todo determine error handling here - simply return the error and let the parent handle?
        expect(result.data).toBeUndefined();
        expect(result.error).toBe(AuthUiErrors.INVALID_TOKEN);
      });

      it('should handle other errors and return the original error', async () => {
        const unexpectedError = new Error('Some other error');
        mockAuthClient.sessionVerificationStatus.mockRejectedValue(
          unexpectedError
        );

        const result = await cachedSignIn(
          mockSessionToken,
          mockAuthClient,
          mockCache,
          mockSession
        );

        expect(mockDiscardSessionToken).not.toHaveBeenCalled();
        expect(result.data).toBeUndefined();
        expect(result.error).toBe(unexpectedError);
      });
    });
  });
});
