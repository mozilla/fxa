/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { OAuthNativeServices } from '@fxa/accounts/oauth';

import {
  Subject,
  SubjectProps,
  createCachedSigninResponseError,
  createMockSigninOAuthNativeIntegration,
  createMockSigninOAuthNativeSyncIntegration,
} from '../../mocks';
import { MOCK_EMAIL, MOCK_SESSION_TOKEN } from '../../../mocks';

jest.mock('../../../../lib/storage-utils', () => ({
  storeAccountData: jest.fn(),
}));

jest.mock('../../../../models', () => ({
  ...jest.requireActual('../../../../models'),
  useSensitiveDataClient: () => ({ setDataType: jest.fn() }),
  useSession: () => ({ sendVerificationCode: jest.fn() }),
  useConfig: () => ({ servicesWithEmailVerification: ['123456'] }),
}));

const mockPasswordlessNavigate = jest.fn();
jest.mock('../../../../lib/hooks/useNavigateWithQuery', () => ({
  useNavigateWithQuery: () => mockPasswordlessNavigate,
}));

let mockLocationPathname = '/signin';
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  navigate: jest.fn(),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: mockLocationPathname, search: '' }),
}));

const render = (props: SubjectProps = {}) =>
  renderWithLocalizationProvider(<Subject {...props} />);

const passwordInputRendered = () => screen.getByLabelText('Password');
const passwordInputNotRendered = () =>
  expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
const thirdPartyAuthRendered = () => {
  screen.getByRole('button', { name: /Continue with Google/ });
  screen.getByRole('button', { name: /Continue with Apple/ });
};

let user: UserEvent;
const submit = () =>
  user.click(screen.getByRole('button', { name: 'Sign in' }));

describe('SigninDecider routing', () => {
  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  describe('cached vs password based on keys-optional', () => {
    it('routes to cached signin for service=relay when supportsKeysOptionalLogin is true', () => {
      const integration = createMockSigninOAuthNativeIntegration({
        service: OAuthNativeServices.Relay,
        isSync: false,
      });
      render({
        integration,
        sessionToken: MOCK_SESSION_TOKEN,
        supportsKeysOptionalLogin: true,
      });

      passwordInputNotRendered();
    });

    it('routes to cached signin for service=smartwindow when supportsKeysOptionalLogin is true', () => {
      const integration = createMockSigninOAuthNativeIntegration({
        service: OAuthNativeServices.SmartWindow,
        isSync: false,
      });
      render({
        integration,
        sessionToken: MOCK_SESSION_TOKEN,
        supportsKeysOptionalLogin: true,
      });

      passwordInputNotRendered();
    });

    it('routes to password signin for service=relay when supportsKeysOptionalLogin is false', () => {
      const integration = createMockSigninOAuthNativeIntegration({
        service: OAuthNativeServices.Relay,
        isSync: false,
      });
      render({
        integration,
        sessionToken: MOCK_SESSION_TOKEN,
        supportsKeysOptionalLogin: false,
        isSignedIntoFirefox: false,
      });

      passwordInputRendered();
    });
  });

  describe('cached vs password based on integration requesting keys', () => {
    it('routes to password signin when integration wants keys and user has a password', () => {
      const integration = createMockSigninOAuthNativeSyncIntegration();
      render({ integration, sessionToken: MOCK_SESSION_TOKEN });

      passwordInputRendered();
    });

    it('routes to cached signin when integration wants keys but user has no password', () => {
      const integration = createMockSigninOAuthNativeSyncIntegration();
      render({
        integration,
        sessionToken: MOCK_SESSION_TOKEN,
        hasPassword: false,
        hasLinkedAccount: true,
      });

      passwordInputNotRendered();
      screen.getByRole('button', { name: 'Sign in' });
    });
  });

  describe('passwordless redirect', () => {
    beforeEach(() => {
      mockPasswordlessNavigate.mockClear();
      mockLocationPathname = '/signin';
    });

    it.each([
      ['/signin', '/signin_passwordless_code'],
      ['/oauth/signin', '/oauth/signin_passwordless_code'],
    ])(
      'redirects passwordless + no-linked + no-session from %s to %s',
      async (from, to) => {
        mockLocationPathname = from;
        render({
          hasPassword: false,
          hasLinkedAccount: false,
          passwordlessSupported: true,
        });

        await waitFor(() => {
          expect(mockPasswordlessNavigate).toHaveBeenCalledWith(
            to,
            expect.objectContaining({
              state: expect.objectContaining({ email: MOCK_EMAIL }),
            })
          );
        });
      }
    );

    it('does NOT redirect when a cached session exists (cached signin handles it)', () => {
      render({
        sessionToken: MOCK_SESSION_TOKEN,
        hasPassword: false,
        hasLinkedAccount: false,
        passwordlessSupported: true,
      });

      expect(mockPasswordlessNavigate).not.toHaveBeenCalled();
    });

    it('does NOT redirect when skipPasswordlessRedirect is set (TOTP loop break)', () => {
      render({
        hasPassword: false,
        hasLinkedAccount: false,
        passwordlessSupported: true,
        skipPasswordlessRedirect: true,
      });

      expect(mockPasswordlessNavigate).not.toHaveBeenCalled();
    });
  });

  describe('SESSION_EXPIRED handoff', () => {
    it('flips from cached to password when cached session expires', async () => {
      const cachedSigninHandler = jest
        .fn()
        .mockReturnValueOnce(createCachedSigninResponseError());
      render({
        sessionToken: MOCK_SESSION_TOKEN,
        cachedSigninHandler,
      });

      await submit();
      await waitFor(() => {
        expect(cachedSigninHandler).toHaveBeenCalledWith(MOCK_SESSION_TOKEN);
        screen.getByText('Session expired. Sign in to continue.');
        passwordInputRendered();
      });
    });

    it('flips from cached to third party auth when session expires for passwordless user with linked account', async () => {
      const cachedSigninHandler = jest
        .fn()
        .mockReturnValueOnce(createCachedSigninResponseError());
      render({
        sessionToken: MOCK_SESSION_TOKEN,
        hasPassword: false,
        hasLinkedAccount: true,
        cachedSigninHandler,
      });

      await submit();
      await waitFor(() => {
        expect(cachedSigninHandler).toHaveBeenCalledWith(MOCK_SESSION_TOKEN);
        screen.getByText('Session expired. Sign in to continue.');
        passwordInputNotRendered();
        thirdPartyAuthRendered();
      });
    });

    it('redirects to passwordless OTP when session expires for passwordless + no-linked user', async () => {
      const cachedSigninHandler = jest
        .fn()
        .mockReturnValueOnce(createCachedSigninResponseError());
      render({
        sessionToken: MOCK_SESSION_TOKEN,
        hasPassword: false,
        hasLinkedAccount: false,
        passwordlessSupported: true,
        cachedSigninHandler,
      });

      // Cached view renders on initial mount (session takes precedence).
      expect(mockPasswordlessNavigate).not.toHaveBeenCalled();

      await submit();
      // SESSION_EXPIRED flips hasCachedSession → decider routes to OTP
      // rather than the dead-end password view.
      await waitFor(() => {
        expect(mockPasswordlessNavigate).toHaveBeenCalledWith(
          '/signin_passwordless_code',
          expect.anything()
        );
      });
    });
  });
});
