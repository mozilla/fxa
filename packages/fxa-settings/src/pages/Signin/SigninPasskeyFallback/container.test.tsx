/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MemoryRouter } from 'react-router';
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
import { queryParamsToMetricsContext } from '../../../lib/metrics';
import { QueryParams } from '../../..';

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
    isFirefoxMobileClient: () => false,
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

const MOCK_FLOW_QUERY_PARAMS = {
  flowId: 'f'.repeat(64),
  flowBeginTime: '1700000000000',
  deviceId: 'd'.repeat(32),
} as unknown as QueryParams;

const mockSessionReauth = jest.fn();
const mockAccountEmails = jest.fn().mockResolvedValue({
  original: MOCK_EMAIL,
  primary: MOCK_EMAIL,
});
const mockHandleNavigation = jest.fn();
const mockNavigate = jest.fn();
let mockLocationState: Record<string, unknown> | undefined = undefined;
let mockOAuthDataError: unknown = null;
const mockFinishOAuthFlowHandler = jest.fn();

jest.mock('react-router', () => ({
  __esModule: true,
  ...jest.requireActual('react-router'),
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
    accountEmails: mockAccountEmails,
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
  mockAccountEmails.mockResolvedValue({
    original: MOCK_EMAIL,
    primary: MOCK_EMAIL,
  });
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
    <MemoryRouter>
      <SigninPasskeyFallbackContainer
        integration={
          (integration ?? createMockSyncIntegration()) as Integration
        }
        flowQueryParams={MOCK_FLOW_QUERY_PARAMS}
      />
    </MemoryRouter>
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
          { original: MOCK_EMAIL, primary: MOCK_EMAIL },
          'pa55word',
          {
            keys: true,
            reason: 'signin',
            metricsContext: queryParamsToMetricsContext(MOCK_FLOW_QUERY_PARAMS),
          }
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

    it('suppresses the keyless login (handleFxaLogin false) when the pre-keys login was already sent', async () => {
      mockLocationState = {
        ...MOCK_LOCATION_STATE,
        syncPreKeysLoginSent: true,
      };
      const { getByTestId } = render();
      submitPassword(getByTestId);

      await waitFor(() => {
        expect(mockHandleNavigation).toHaveBeenCalledWith(
          expect.objectContaining({
            handleFxaLogin: false,
            handleFxaOAuthLogin: true,
          })
        );
      });
    });

    it('discards the stale session and restarts sign-in on INVALID_TOKEN reauth', async () => {
      const discardSpy = jest
        .spyOn(CacheModule, 'discardSessionToken')
        .mockImplementation(() => {});
      mockSessionReauth.mockRejectedValueOnce({
        errno: AuthUiErrors.INVALID_TOKEN.errno,
      });
      const { getByTestId } = render();
      submitPassword(getByTestId);

      await waitFor(() => {
        expect(discardSpy).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
      expect(
        GleanMetrics.passkeyEnterPassword.submitFrontendError
      ).not.toHaveBeenCalled();
    });

    it('for reason=resume, sends verificationMethod undefined and no passkey metrics', async () => {
      mockLocationState = { ...MOCK_LOCATION_STATE, reason: 'resume' };
      const { getByTestId } = render();
      submitPassword(getByTestId);

      await waitFor(() => {
        expect(mockHandleNavigation).toHaveBeenCalled();
      });
      const navArg = mockHandleNavigation.mock.calls[0][0];
      expect(navArg.signinData.verificationMethod).toBeUndefined();
      expect(GleanMetrics.passkeyEnterPassword.success).not.toHaveBeenCalled();
      expect(GleanMetrics.passkey.authSuccess).not.toHaveBeenCalled();
    });

    it('passes the flow metricsContext to sessionReauth so the deferred account.login is correlated', async () => {
      const { getByTestId } = render();
      submitPassword(getByTestId);

      await waitFor(() => {
        expect(mockSessionReauth).toHaveBeenCalledWith(
          MOCK_SESSION_TOKEN,
          { original: MOCK_EMAIL, primary: MOCK_EMAIL },
          'pa55word',
          expect.objectContaining({
            reason: 'signin',
            metricsContext: expect.objectContaining({
              flowId: MOCK_FLOW_QUERY_PARAMS.flowId,
              flowBeginTime: Number(MOCK_FLOW_QUERY_PARAMS.flowBeginTime),
              deviceId: MOCK_FLOW_QUERY_PARAMS.deviceId,
            }),
          })
        );
      });
    });

    it('performs navigation to finish sign-in after reauth on desktop', async () => {
      const { getByTestId } = render();
      submitPassword(getByTestId);

      await waitFor(() => {
        expect(mockHandleNavigation).toHaveBeenCalledWith(
          expect.objectContaining({ performNavigation: true })
        );
      });
    });

    it('skips navigation after reauth on Firefox mobile so Firefox finishes sign-in via WebChannel', async () => {
      const mobileIntegration = {
        ...createMockSyncIntegration(),
        isFirefoxMobileClient: () => true,
      } as unknown as Integration;
      const { getByTestId } = render(mobileIntegration);
      submitPassword(getByTestId);

      await waitFor(() => {
        expect(mockHandleNavigation).toHaveBeenCalledWith(
          expect.objectContaining({ performNavigation: false })
        );
      });
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

    beforeEach(() => {
      mockLocationState = { passkeySurface: 'signin' };
      jest.spyOn(CacheModule, 'currentAccount').mockReturnValue({
        uid: MOCK_UID,
        email: MOCK_EMAIL,
        sessionToken: MOCK_SESSION_TOKEN,
        verified: true,
      });
    });

    it('tags the enter-password view and success events with the router-state surface', async () => {
      const { getByTestId } = render();
      await waitFor(() => {
        expect(GleanMetrics.passkeyEnterPassword.view).toHaveBeenCalledWith({
          event: { reason: 'signin' },
        });
      });
      submitPassword(getByTestId);
      await waitFor(() => {
        expect(GleanMetrics.passkeyEnterPassword.success).toHaveBeenCalledWith({
          event: { reason: 'signin' },
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

    // Only emailfirst/signin reach the existing-password fallback; no-password
    // surfaces (otplogin, alternative_auth) never do.
    it.each([
      ['emailfirst' as const, 'emailfirst_withpassword'],
      ['signin' as const, 'signin_withpassword'],
    ])(
      'fires passkey.auth_success with reason=%s on successful reauth (passkeySurface=%s)',
      async (surface, expectedReason) => {
        mockLocationState = { passkeySurface: surface };
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
