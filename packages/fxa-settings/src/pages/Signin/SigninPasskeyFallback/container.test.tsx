/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

import * as CacheModule from '../../../lib/cache';
import * as HooksModule from '../../../lib/oauth/hooks';
import * as SigninUtilsModule from '../utils';
import { Integration, IntegrationType } from '../../../models';
import { MozServices } from '../../../lib/types';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { MOCK_EMAIL, MOCK_SESSION_TOKEN, MOCK_UID } from '../../mocks';
import SigninPasskeyFallbackContainer from './container';
import GleanMetrics from '../../../lib/glean';

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    passkeyEnterPassword: {
      view: jest.fn(),
      engage: jest.fn(),
      submit: jest.fn(),
      submitFrontendError: jest.fn(),
      success: jest.fn(),
    },
    passkey: {
      authSuccess: jest.fn(),
    },
  },
}));

function createMockSyncIntegration() {
  return {
    type: IntegrationType.OAuthNative,
    getService: () => MozServices.FirefoxSync,
    isSync: () => true,
    requiresKeys: () => true,
    wantsKeys: () => true,
    getCmsInfo: () => undefined,
    data: {},
  };
}

const MOCK_LOCATION_STATE = {
  email: MOCK_EMAIL,
  uid: MOCK_UID,
  sessionToken: MOCK_SESSION_TOKEN,
  emailVerified: true,
  sessionVerified: true,
};

const mockSessionReauth = jest.fn();
const mockHandleNavigation = jest.fn();
const mockNavigate = jest.fn();
let mockLocationState: Record<string, unknown> | undefined = undefined;
let mockOAuthDataError: unknown = null;
const mockFinishOAuthFlowHandler = jest.fn();

jest.mock('@reach/router', () => ({
  __esModule: true,
  ...jest.requireActual('@reach/router'),
  useLocation: () => ({
    pathname: '/signin_passkey_fallback',
    search: '?context=oauth_webchannel_v1',
    state: mockLocationState,
  }),
}));

jest.mock('../../../lib/hooks/useNavigateWithQuery', () => ({
  useNavigateWithQuery: () => mockNavigate,
}));

jest.mock('../../../models', () => ({
  ...jest.requireActual('../../../models'),
  useAuthClient: () => ({
    sessionReauth: mockSessionReauth,
  }),
  useFtlMsgResolver: () => ({
    getMsg: (_id: string, fallback: string) => fallback,
  }),
}));

jest.mock('../../../lib/oauth/hooks', () => ({
  useFinishOAuthFlowHandler: jest.fn(),
}));

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  handleNavigation: jest.fn(),
}));

function applyDefaultMocks(): void {
  jest.resetAllMocks();
  mockLocationState = MOCK_LOCATION_STATE;
  mockOAuthDataError = null;
  mockSessionReauth.mockResolvedValue({
    keyFetchToken: 'keyfetchtoken',
    unwrapBKey: 'unwrapbkey',
  });
  mockHandleNavigation.mockResolvedValue({ error: undefined });
  (SigninUtilsModule.handleNavigation as jest.Mock).mockImplementation(
    mockHandleNavigation
  );
  (HooksModule.useFinishOAuthFlowHandler as jest.Mock).mockImplementation(
    () => ({
      finishOAuthFlowHandler: mockFinishOAuthFlowHandler,
      oAuthDataError: mockOAuthDataError,
    })
  );
}

function render(integration?: Integration) {
  return renderWithLocalizationProvider(
    <LocationProvider>
      <SigninPasskeyFallbackContainer
        integration={
          (integration ?? createMockSyncIntegration()) as Integration
        }
      />
    </LocationProvider>
  );
}

describe('SigninPasskeyFallback container', () => {
  beforeEach(() => {
    applyDefaultMocks();
  });

  describe('signinState hydration', () => {
    it('renders the page when router state provides session, email, uid', async () => {
      const { getByTestId } = render();
      await waitFor(() => {
        expect(getByTestId('passkey-fallback-email')).toHaveTextContent(
          MOCK_EMAIL
        );
      });
    });

    it('falls back to localStorage when router state is empty', async () => {
      mockLocationState = undefined;
      jest.spyOn(CacheModule, 'currentAccount').mockReturnValue({
        uid: MOCK_UID,
        email: MOCK_EMAIL,
        sessionToken: MOCK_SESSION_TOKEN,
        verified: true,
      });
      const { getByTestId } = render();
      await waitFor(() => {
        expect(getByTestId('passkey-fallback-email')).toHaveTextContent(
          MOCK_EMAIL
        );
      });
    });

    it('redirects to / when neither router state nor localStorage have a session', async () => {
      mockLocationState = undefined;
      jest.spyOn(CacheModule, 'currentAccount').mockReturnValue(undefined);
      render();
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('onContinue', () => {
    function submitPassword(getByTestId: (id: string) => HTMLElement) {
      fireEvent.change(getByTestId('password-input-field'), {
        target: { value: 'pa55word' },
      });
      fireEvent.click(getByTestId('continue-button'));
    }

    it('calls sessionReauth with keys=true and forwards to handleNavigation', async () => {
      const { getByTestId } = render();
      submitPassword(getByTestId);

      await waitFor(() => {
        expect(mockSessionReauth).toHaveBeenCalledWith(
          MOCK_SESSION_TOKEN,
          MOCK_EMAIL,
          'pa55word',
          { keys: true }
        );
      });
      expect(mockHandleNavigation).toHaveBeenCalledWith(
        expect.objectContaining({
          email: MOCK_EMAIL,
          handleFxaLogin: true,
          handleFxaOAuthLogin: true,
          signinData: expect.objectContaining({
            uid: MOCK_UID,
            sessionToken: MOCK_SESSION_TOKEN,
            keyFetchToken: 'keyfetchtoken',
          }),
        })
      );
    });

    it('renders an error banner when sessionReauth throws', async () => {
      mockSessionReauth.mockRejectedValueOnce({
        errno: 103,
        message: 'Incorrect password',
      });
      const { getByTestId, findByText } = render();
      submitPassword(getByTestId);
      expect(await findByText(/Incorrect password/i)).toBeInTheDocument();
    });

    it('renders an error banner when handleNavigation returns an error', async () => {
      mockHandleNavigation.mockResolvedValueOnce({
        error: { errno: 103, message: 'Incorrect password' },
      });
      const { getByTestId, findByText } = render();
      submitPassword(getByTestId);
      expect(await findByText(/Incorrect password/i)).toBeInTheDocument();
    });
  });

  describe('OAuthDataError', () => {
    it('renders OAuthDataError instead of the fallback form when oAuthDataError is set', () => {
      mockOAuthDataError = { errno: 1000, message: 'OAuth error' };
      (HooksModule.useFinishOAuthFlowHandler as jest.Mock).mockImplementation(
        () => ({
          finishOAuthFlowHandler: mockFinishOAuthFlowHandler,
          oAuthDataError: mockOAuthDataError,
        })
      );
      const { queryByTestId, getByText } = render();
      expect(getByText('Bad Request')).toBeInTheDocument();
      expect(queryByTestId('passkey-fallback-email')).not.toBeInTheDocument();
    });
  });

  describe('Glean events', () => {
    function submitPassword(getByTestId: (id: string) => HTMLElement) {
      fireEvent.change(getByTestId('password-input-field'), {
        target: { value: 'pa55word' },
      });
      fireEvent.click(getByTestId('continue-button'));
    }

    it('fires success with the passkeySurface reason after sessionReauth resolves', async () => {
      mockLocationState = {
        ...MOCK_LOCATION_STATE,
        passkeySurface: 'login',
      };
      const { getByTestId } = render();
      submitPassword(getByTestId);
      await waitFor(() => {
        expect(GleanMetrics.passkeyEnterPassword.success).toHaveBeenCalledWith({
          event: { reason: 'login' },
        });
      });
      expect(
        GleanMetrics.passkeyEnterPassword.submitFrontendError
      ).not.toHaveBeenCalled();
    });

    it('fires submit_frontend_error with reason=incorrect_password on INCORRECT_PASSWORD errno', async () => {
      mockSessionReauth.mockRejectedValueOnce({
        errno: AuthUiErrors.INCORRECT_PASSWORD.errno,
        message: 'Incorrect password',
      });
      const { getByTestId } = render();
      submitPassword(getByTestId);
      await waitFor(() => {
        expect(
          GleanMetrics.passkeyEnterPassword.submitFrontendError
        ).toHaveBeenCalledWith({ event: { reason: 'incorrect_password' } });
      });
      expect(GleanMetrics.passkeyEnterPassword.success).not.toHaveBeenCalled();
    });

    it('fires submit_frontend_error with reason=server_error on other errnos', async () => {
      mockSessionReauth.mockRejectedValueOnce({
        errno: 999,
        message: 'Other',
      });
      const { getByTestId } = render();
      submitPassword(getByTestId);
      await waitFor(() => {
        expect(
          GleanMetrics.passkeyEnterPassword.submitFrontendError
        ).toHaveBeenCalledWith({ event: { reason: 'server_error' } });
      });
    });

    it('fires submit_frontend_error with reason=server_error when handleNavigation returns an error', async () => {
      mockHandleNavigation.mockResolvedValueOnce({
        error: { errno: 999, message: 'Nav broke' },
      });
      const { getByTestId } = render();
      submitPassword(getByTestId);
      await waitFor(() => {
        expect(
          GleanMetrics.passkeyEnterPassword.submitFrontendError
        ).toHaveBeenCalledWith({ event: { reason: 'server_error' } });
      });
      expect(GleanMetrics.passkeyEnterPassword.success).not.toHaveBeenCalled();
    });

    it.each([
      ['emailfirst' as const, 'emailfirst_withpassword'],
      ['login' as const, 'signin_withpassword'],
    ])(
      'fires passkey.auth_success with reason=%s on successful reauth (passkeySurface=%s)',
      async (surface, expectedReason) => {
        mockLocationState = {
          ...MOCK_LOCATION_STATE,
          passkeySurface: surface,
        };
        const { getByTestId } = render();
        submitPassword(getByTestId);
        await waitFor(() => {
          expect(GleanMetrics.passkey.authSuccess).toHaveBeenCalledWith({
            event: { reason: expectedReason },
          });
        });
      }
    );

    it('does NOT fire passkey.auth_success when reauth fails', async () => {
      mockSessionReauth.mockRejectedValueOnce({
        errno: AuthUiErrors.INCORRECT_PASSWORD.errno,
      });
      const { getByTestId } = render();
      submitPassword(getByTestId);
      await waitFor(() => {
        expect(
          GleanMetrics.passkeyEnterPassword.submitFrontendError
        ).toHaveBeenCalled();
      });
      expect(GleanMetrics.passkey.authSuccess).not.toHaveBeenCalled();
    });
  });
});
