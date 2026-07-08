/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as ReactUtils from 'fxa-react/lib/utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { usePageViewEvent } from '../../../lib/metrics';
import { viewName } from '.';
import { mockAppContext } from '../../../models/mocks';
import { REACT_ENTRYPOINT } from '../../../constants';
import { AppContext } from '../../../models';
import { SigninPasswordlessCodeProps } from './interfaces';
import {
  Subject,
  MOCK_PASSWORDLESS_CODE,
  createOAuthNativeIntegration,
} from './mocks';
import {
  MOCK_CMS_INFO,
  MOCK_EMAIL,
  MOCK_OAUTH_FLOW_HANDLER_RESPONSE,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
} from '../../mocks';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import {
  createMockSigninOAuthIntegration,
  createMockSigninOAuthNativeIntegration,
  createMockSigninWebIntegration,
} from '../mocks';
import { SigninOAuthIntegration } from '../interfaces';
import { MozServices } from '../../../lib/types';
import GleanMetrics from '../../../lib/glean';
import { OAuthNativeServices } from '@fxa/accounts/oauth';
import { isWebAuthnSupported } from '../../../lib/passkeys/webauthn';

jest.mock('../../../lib/passkeys/webauthn', () => ({
  ...jest.requireActual('../../../lib/passkeys/webauthn'),
  isWebAuthnSupported: jest.fn(),
}));

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
  queryParamsToMetricsContext: jest.fn((params) => params || {}),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    passwordlessLogin: {
      view: jest.fn(),
      engage: jest.fn(),
      submit: jest.fn(),
      submitSuccess: jest.fn(),
      error: jest.fn(),
      resendCode: jest.fn(),
      changeEmail: jest.fn(),
    },
    passwordlessReg: {
      view: jest.fn(),
      engage: jest.fn(),
      submit: jest.fn(),
      submitSuccess: jest.fn(),
      error: jest.fn(),
      resendCode: jest.fn(),
      changeEmail: jest.fn(),
    },
    passkey: {
      buttonView: jest.fn(),
      authSuccess: jest.fn(),
    },
    isDone: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockGleanPasswordlessLogin = GleanMetrics.passwordlessLogin;
const mockGleanPasswordlessReg = GleanMetrics.passwordlessReg;

function applyDefaultMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();

  mockReactUtilsModule();
}

let mockNavigate = jest.fn();
let mockNavigateWithQuery = jest.fn().mockResolvedValue(undefined);
let mockEnsureCanLinkAcountOrRedirect = jest.fn().mockResolvedValue(undefined);

jest.mock('react-router', () => {
  return {
    __esModule: true,
    ...jest.requireActual('react-router'),
    navigate: jest.fn(),
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/signin_passwordless_code', search: '' }),
  };
});

jest.mock('../../../lib/hooks/useNavigateWithQuery', () => ({
  useNavigateWithQuery: () => mockNavigateWithQuery,
}));

let mockHandleNavigation = jest.fn().mockResolvedValue({ error: undefined });

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  getSyncNavigate: jest.fn((search, options) => ({
    to: '/connect_another_device',
  })),
  handleNavigation: (...args: any[]) => mockHandleNavigation(...args),
  ensureCanLinkAcountOrRedirect: (...args: any[]) =>
    mockEnsureCanLinkAcountOrRedirect(...args),
}));

jest.mock('../../../lib/hooks/useWebRedirect', () => ({
  useWebRedirect: () => ({ isValid: true }),
}));

const mockStoreAccountData = jest.fn();
jest.mock('../../../lib/storage-utils', () => ({
  ...jest.requireActual('../../../lib/storage-utils'),
  storeAccountData: (...args: any[]) => mockStoreAccountData(...args),
  setCurrentAccount: jest.fn(),
}));

let mockAuthClient: any;

function resetMockAuthClient() {
  mockAuthClient = {
    passwordlessConfirmCode: jest.fn().mockResolvedValue({
      uid: MOCK_UID,
      sessionToken: MOCK_SESSION_TOKEN,
      verified: true,
      authAt: Date.now(),
    }),
    passwordlessResendCode: jest.fn().mockResolvedValue(true),
  };
}

function render(
  props: Partial<SigninPasswordlessCodeProps> & {
    isSignup?: boolean;
    browserSupportsKeysOptional?: boolean;
  } = {}
) {
  if (!props.integration) {
    props.integration =
      createMockSigninWebIntegration() as SigninOAuthIntegration;
  }

  renderWithLocalizationProvider(
    <AppContext.Provider value={mockAppContext({ authClient: mockAuthClient })}>
      <Subject {...props} />
    </AppContext.Provider>
  );
}

function mockReactUtilsModule() {
  jest.spyOn(ReactUtils, 'hardNavigate').mockImplementation(() => {});
}

describe('SigninPasswordlessCode page', () => {
  beforeEach(() => {
    applyDefaultMocks();
    resetMockAuthClient();
    mockNavigate = jest.fn();
    mockNavigateWithQuery = jest.fn().mockResolvedValue(undefined);
    mockEnsureCanLinkAcountOrRedirect = jest.fn().mockResolvedValue(true);
    mockHandleNavigation = jest
      .fn()
      .mockImplementation(async (navigationOptions) => {
        // Simulate handleNavigation behavior for unverified sessions with TOTP
        const { signinData } = navigationOptions;
        if (
          signinData.verificationMethod === 'totp-2fa' &&
          !signinData.sessionVerified
        ) {
          const mockNavigateModule = jest.requireMock('react-router');
          mockNavigateModule.navigate(
            `/signin_totp_code${navigationOptions.queryParams || ''}`,
            {
              state: {
                email: navigationOptions.email,
                uid: signinData.uid,
                sessionToken: signinData.sessionToken,
                emailVerified: signinData.emailVerified,
                sessionVerified: signinData.sessionVerified,
                verificationMethod: signinData.verificationMethod,
                verificationReason: signinData.verificationReason,
              },
            }
          );
        }
        return { error: undefined };
      });
  });

  describe('passkey signin CTA gating', () => {
    beforeEach(() => {
      (isWebAuthnSupported as jest.Mock).mockReturnValue(true);
    });

    const renderWithPasskeyFlags = (
      props: Partial<SigninPasswordlessCodeProps> & { isSignup?: boolean } = {}
    ) => {
      const context = mockAppContext({ authClient: mockAuthClient });
      if (context.config) {
        context.config.featureFlags = {
          ...context.config.featureFlags,
          passkeysEnabled: true,
          passkeyAuthenticationEnabled: true,
        };
      }
      renderWithLocalizationProvider(
        <AppContext.Provider value={context}>
          <Subject integration={createMockSigninWebIntegration()} {...props} />
        </AppContext.Provider>
      );
    };
    const passkeyButton = () =>
      screen.queryByRole('button', { name: 'Sign in with passkey' });

    it('renders the passkey CTA when hasPasskey is true', () => {
      renderWithPasskeyFlags({ isSignup: false, hasPasskey: true });
      expect(passkeyButton()).toBeInTheDocument();
    });

    it('hides the passkey CTA when hasPasskey is undefined (fails closed)', () => {
      renderWithPasskeyFlags({ isSignup: false, hasPasskey: undefined });
      expect(passkeyButton()).not.toBeInTheDocument();
    });

    it('hides the passkey CTA when WebAuthn is unsupported', () => {
      (isWebAuthnSupported as jest.Mock).mockReturnValue(false);
      renderWithPasskeyFlags({ isSignup: false, hasPasskey: true });
      expect(passkeyButton()).not.toBeInTheDocument();
    });
  });

  describe('renders as expected', () => {
    it('renders signin flow with correct heading and instructions', () => {
      render({ isSignup: false });

      const headingEl = screen.getByRole('heading', { level: 1 });
      expect(headingEl).toHaveTextContent('Enter confirmation code');

      // Check for the instruction text including "Use a different account"
      screen.getByText(
        (_, element) =>
          !!(
            element?.tagName === 'P' &&
            element?.textContent?.includes(
              `Enter the code that was sent to ${MOCK_EMAIL}`
            ) &&
            element?.textContent?.includes('Use a different account')
          )
      );

      screen.getByLabelText('Enter 6-digit code');
      screen.getByRole('button', { name: 'Confirm' });
      screen.getByText('Code expired?');

      expect(
        screen.getByTestId('terms-privacy-agreement-default')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Terms of Service' })
      ).toHaveAttribute('href', '/legal/terms');
      expect(
        screen.getByRole('link', { name: 'Privacy Notice' })
      ).toHaveAttribute('href', '/legal/privacy');
    });

    it('renders signup flow with correct heading and instructions', () => {
      render({ isSignup: true });

      const headingEl = screen.getByRole('heading', { level: 1 });
      expect(headingEl).toHaveTextContent('Enter confirmation code');

      // Check for signup-specific instruction text including "Use a different account"
      screen.getByText(
        (_, element) =>
          !!(
            element?.tagName === 'P' &&
            element?.textContent?.includes(
              `Enter the code that was sent to ${MOCK_EMAIL}`
            ) &&
            element?.textContent?.includes('Use a different account')
          )
      );
    });

    it('renders "Use a different account" link', () => {
      render({ isSignup: false });

      screen.getByRole('link', { name: 'Use a different account' });
    });

    it('renders additional accessibility info from CMS', () => {
      const integration = createOAuthNativeIntegration(true, MOCK_CMS_INFO);
      render({ integration, isSignup: false });

      expect(
        screen.getByText(MOCK_CMS_INFO.shared.additionalAccessibilityInfo)
      ).toBeInTheDocument();
    });

    it('does not render additional accessibility info when CMS info is absent', () => {
      render({ isSignup: false });

      expect(
        screen.queryByText(MOCK_CMS_INFO.shared.additionalAccessibilityInfo)
      ).not.toBeInTheDocument();
    });
  });

  it('emits a metrics event on render', () => {
    render();
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  describe('"Use a different account" link', () => {
    it('is hidden when signed into Firefox desktop', () => {
      const integration = createMockSigninOAuthNativeIntegration();
      render({ integration, isSignedIntoFirefox: true });

      expect(
        screen.queryByRole('link', { name: 'Use a different account' })
      ).not.toBeInTheDocument();
    });

    it('is shown when signed into Firefox but not a desktop client (mobile)', () => {
      const integration = createMockSigninOAuthNativeIntegration({
        isSync: true,
        isMobile: true,
      });
      render({ integration, isSignedIntoFirefox: true });

      screen.getByRole('link', { name: 'Use a different account' });
    });

    it('is shown when on a desktop Firefox client but not signed into Firefox', () => {
      const integration = createMockSigninOAuthNativeIntegration();
      render({ integration, isSignedIntoFirefox: false });

      screen.getByRole('link', { name: 'Use a different account' });
    });

    it('clicking navigates to root and removes email from query params', async () => {
      render({ isSignup: false });

      const link = screen.getByRole('link', {
        name: 'Use a different account',
      });
      fireEvent.click(link);

      await waitFor(() => {
        expect(mockNavigateWithQuery).toHaveBeenCalledWith('/?', {
          state: { prefillEmail: MOCK_EMAIL },
        });
      });
    });

    it('removes email from query params when present while preserving other params', async () => {
      // Since the link uses window.location.search, we need to mock that
      const originalSearch = window.location.search;
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          ...window.location,
          search: '?email=test@example.com&other=param',
        },
      });

      render({ isSignup: false });

      const link = screen.getByRole('link', {
        name: 'Use a different account',
      });
      fireEvent.click(link);

      await waitFor(() => {
        expect(mockNavigateWithQuery).toHaveBeenCalledWith('/?other=param', {
          state: { prefillEmail: MOCK_EMAIL },
        });
      });

      // Restore original
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          ...window.location,
          search: originalSearch,
        },
      });
    });
  });

  describe('handleResendCode submission', () => {
    async function renderAndResend() {
      render();
      const resendButton = screen.getByRole('button', {
        name: 'Email new code.',
      });
      fireEvent.click(resendButton);
      await waitFor(() => {
        expect(mockAuthClient.passwordlessResendCode).toHaveBeenCalledWith(
          MOCK_EMAIL,
          {
            clientId: undefined,
            service: MozServices.Default,
            metricsContext: {
              clientId: undefined,
            },
          }
        );
      });
    }

    it('on success, renders banner', async () => {
      await renderAndResend();
      await screen.findByText(/A new code was sent to your email./);
    });

    it('on throttled error, renders banner with throttled message', async () => {
      mockAuthClient.passwordlessResendCode = jest
        .fn()
        .mockRejectedValue(AuthUiErrors.THROTTLED);

      render();
      const resendButton = screen.getByRole('button', {
        name: 'Email new code.',
      });
      fireEvent.click(resendButton);

      await screen.findByText(/tried too many times/);
    });

    it('on throttled resend, disables the submit button', async () => {
      mockAuthClient.passwordlessResendCode = jest
        .fn()
        .mockRejectedValue({ ...AuthUiErrors.THROTTLED, retryAfter: 60_000 });

      render();

      // Enter a valid code so the submit button is enabled absent throttling;
      // this isolates the throttle disable from the empty-input disable.
      const user = userEvent.setup();
      await user.type(
        screen.getByLabelText('Enter 6-digit code'),
        MOCK_PASSWORDLESS_CODE
      );
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeEnabled();

      fireEvent.click(screen.getByRole('button', { name: 'Email new code.' }));
      await screen.findByText(/tried too many times/);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();
      });
    });

    it('on other error, renders banner with expected default error message', async () => {
      mockAuthClient.passwordlessResendCode = jest
        .fn()
        .mockRejectedValue(new Error());

      render();
      const resendButton = screen.getByRole('button', {
        name: 'Email new code.',
      });
      fireEvent.click(resendButton);

      await screen.findByText(/Something went wrong/);
    });

    it('shows countdown timer after successful resend', async () => {
      jest.useFakeTimers();
      render();

      const resendButton = screen.getByRole('button', {
        name: 'Email new code.',
      });
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(mockAuthClient.passwordlessResendCode).toHaveBeenCalled();
      });

      // Countdown button should appear and be disabled
      const resendButtonAfter = await waitFor(() => {
        const button = screen.getByRole('button', {
          name: /Email new code in/,
        });
        expect(button).toBeDisabled();
        return button;
      });

      expect(resendButtonAfter.textContent).toMatch(/\d+/);

      jest.useRealTimers();
    });
  });

  describe('onSubmit code submission', () => {
    async function submit() {
      const user = userEvent.setup();
      const button = screen.getByRole('button', { name: 'Confirm' });
      expect(button).toBeEnabled();
      await user.click(button);
    }

    async function submitCode(code = MOCK_PASSWORDLESS_CODE) {
      const user = userEvent.setup();
      const input = screen.getByLabelText('Enter 6-digit code');
      await user.type(input, code);
      await submit();
    }

    describe('does not submit and displays tooltip', () => {
      beforeEach(() => {
        render();
      });

      it('if no input', async () => {
        const button = screen.getByRole('button', { name: 'Confirm' });
        expect(button).toBeDisabled();

        // Button should be disabled, so clicking it should not trigger submission
        fireEvent.click(button);
        expect(mockAuthClient.passwordlessConfirmCode).not.toHaveBeenCalled();
      });

      it('if input length is less than 6', async () => {
        const user = userEvent.setup();
        const input = screen.getByLabelText('Enter 6-digit code');
        await user.type(input, '12345');

        const button = screen.getByRole('button', { name: 'Confirm' });
        expect(button).toBeDisabled();

        fireEvent.click(button);
        expect(mockAuthClient.passwordlessConfirmCode).not.toHaveBeenCalled();
      });

      it('if input is not numeric', async () => {
        const user = userEvent.setup();
        const input = screen.getByLabelText('Enter 6-digit code');
        await user.type(input, '12345a');

        const button = screen.getByRole('button', { name: 'Confirm' });
        expect(button).toBeDisabled();

        fireEvent.click(button);
        expect(mockAuthClient.passwordlessConfirmCode).not.toHaveBeenCalled();
      });

      it('if input is scientific notation', async () => {
        const user = userEvent.setup();
        const input = screen.getByLabelText('Enter 6-digit code');
        await user.type(input, '100e10');

        const button = screen.getByRole('button', { name: 'Confirm' });
        expect(button).toBeDisabled();

        fireEvent.click(button);
        expect(mockAuthClient.passwordlessConfirmCode).not.toHaveBeenCalled();
      });
    });

    it('on throttled error, renders banner with throttled message', async () => {
      mockAuthClient.passwordlessConfirmCode = jest
        .fn()
        .mockRejectedValue(AuthUiErrors.THROTTLED);

      render();
      await submitCode();

      await screen.findByText(/tried too many times/);
    });

    it('on throttled submit with retryAfter, disables submit and resend', async () => {
      mockAuthClient.passwordlessConfirmCode = jest
        .fn()
        .mockRejectedValue({ ...AuthUiErrors.THROTTLED, retryAfter: 60_000 });

      render();
      await submitCode();

      await screen.findByText(/tried too many times/);
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();
      expect(
        screen.getByRole('button', { name: 'Email new code.' })
      ).toBeDisabled();
    });

    it('on invalid code error, renders error message in tooltip', async () => {
      mockAuthClient.passwordlessConfirmCode = jest
        .fn()
        .mockRejectedValue(AuthUiErrors.INVALID_VERIFICATION_CODE);

      render();
      await submitCode();

      expect(await screen.findByTestId('tooltip')).toHaveTextContent(
        /Invalid confirmation code/
      );
    });

    it('navigates to TOTP code page when account has 2FA', async () => {
      mockAuthClient.passwordlessConfirmCode = jest.fn().mockResolvedValue({
        uid: MOCK_UID,
        sessionToken: MOCK_SESSION_TOKEN,
        verified: false,
        authAt: Date.now(),
        verificationMethod: 'totp-2fa',
        verificationReason: 'login',
      });

      const integration = createMockSigninWebIntegration();
      integration.isSync = jest.fn().mockReturnValue(true);
      // Sync requires keys, so a passwordless sign-in must set a password
      // (passwordless TOTP accounts verify via email first).
      integration.requiresKeys = jest.fn().mockReturnValue(true);

      render({ integration, isSignup: false });
      await submitCode();

      await waitFor(() => {
        expect(mockNavigateWithQuery).toHaveBeenCalledWith(
          '/signin_totp_code',
          expect.objectContaining({
            replace: true,
            state: expect.objectContaining({
              email: MOCK_EMAIL,
              sessionToken: MOCK_SESSION_TOKEN,
              uid: MOCK_UID,
              sessionVerified: false,
              verificationMethod: 'totp-2fa',
              verificationReason: 'login',
              isPasswordlessOtpSignin: true,
            }),
          })
        );
      });
    });

    it('stores account data with verified=false when TOTP is required', async () => {
      mockAuthClient.passwordlessConfirmCode = jest.fn().mockResolvedValue({
        uid: MOCK_UID,
        sessionToken: MOCK_SESSION_TOKEN,
        verified: false,
        authAt: Date.now(),
        verificationMethod: 'totp-2fa',
        verificationReason: 'login',
      });

      const integration = createMockSigninWebIntegration();
      integration.isSync = jest.fn().mockReturnValue(true);

      render({ integration, isSignup: false });
      await submitCode();

      await waitFor(() => {
        expect(mockStoreAccountData).toHaveBeenCalledWith(
          expect.objectContaining({
            uid: MOCK_UID,
            sessionToken: MOCK_SESSION_TOKEN,
            email: MOCK_EMAIL,
            verified: false,
            sessionVerified: false,
          })
        );
      });
    });

    it('navigates to TOTP code page with OAuth integration when account has 2FA', async () => {
      const mockNavigateModule = jest.requireMock('react-router');
      mockAuthClient.passwordlessConfirmCode = jest.fn().mockResolvedValue({
        uid: MOCK_UID,
        sessionToken: MOCK_SESSION_TOKEN,
        verified: false,
        authAt: Date.now(),
        verificationMethod: 'totp-2fa',
        verificationReason: 'login',
      });

      const integration = createMockSigninOAuthIntegration();

      render({ integration, isSignup: false });
      await submitCode();

      await waitFor(() => {
        expect(mockNavigateModule.navigate).toHaveBeenCalledWith(
          '/signin_totp_code',
          expect.objectContaining({
            state: expect.objectContaining({
              email: MOCK_EMAIL,
              sessionToken: MOCK_SESSION_TOKEN,
              uid: MOCK_UID,
              sessionVerified: false,
              verificationMethod: 'totp-2fa',
              verificationReason: 'login',
            }),
          })
        );
      });
    });

    describe('on success', () => {
      let hardNavigateSpy: jest.SpyInstance;

      beforeEach(() => {
        hardNavigateSpy = jest
          .spyOn(ReactUtils, 'hardNavigate')
          .mockImplementation(() => {});
      });

      afterEach(() => {
        hardNavigateSpy.mockRestore();
      });

      it('redirects to set password page for Sync signin flow when user accepts merge', async () => {
        // Mock ensureCanLinkAcountOrRedirect to return true (user can link account)
        mockEnsureCanLinkAcountOrRedirect = jest.fn().mockResolvedValue(true);

        const integration = createMockSigninWebIntegration();
        integration.isSync = jest.fn().mockReturnValue(true);
        integration.requiresKeys = jest.fn().mockReturnValue(true);

        render({ integration, isSignup: false });
        await submitCode();

        await waitFor(() => {
          expect(mockEnsureCanLinkAcountOrRedirect).toHaveBeenCalledWith(
            expect.objectContaining({
              email: MOCK_EMAIL,
              uid: MOCK_UID,
              navigateWithQuery: mockNavigateWithQuery,
            })
          );
        });

        await waitFor(() => {
          expect(mockNavigateWithQuery).toHaveBeenCalledWith(
            '/post_verify/set_password',
            expect.objectContaining({
              replace: true,
              state: {
                passwordCreationReason: 'otp',
              },
            })
          );
        });
      });

      it('does not navigate to set password when user rejects Sync merge', async () => {
        // Mock ensureCanLinkAcountOrRedirect to return false (user rejected merge)
        mockEnsureCanLinkAcountOrRedirect = jest.fn().mockResolvedValue(false);

        const integration = createMockSigninWebIntegration();
        integration.isSync = jest.fn().mockReturnValue(true);
        integration.requiresKeys = jest.fn().mockReturnValue(true);

        render({ integration, isSignup: false });
        await submitCode();

        await waitFor(() => {
          expect(mockEnsureCanLinkAcountOrRedirect).toHaveBeenCalled();
        });

        // Should not navigate to set password page when user rejects merge
        expect(mockNavigateWithQuery).not.toHaveBeenCalledWith(
          '/post_verify/set_password',
          expect.anything()
        );
      });

      it('skips merge check for Sync signup flow', async () => {
        mockEnsureCanLinkAcountOrRedirect = jest.fn().mockResolvedValue(true);

        const integration = createMockSigninWebIntegration();
        integration.isSync = jest.fn().mockReturnValue(true);
        integration.requiresKeys = jest.fn().mockReturnValue(true);

        render({ integration, isSignup: true });
        await submitCode();

        // ensureCanLinkAcountOrRedirect should NOT be called for signup flows
        await waitFor(() => {
          expect(mockNavigateWithQuery).toHaveBeenCalledWith(
            '/post_verify/set_password',
            expect.objectContaining({
              replace: true,
              state: {
                passwordCreationReason: 'otp',
              },
            })
          );
        });

        expect(mockEnsureCanLinkAcountOrRedirect).not.toHaveBeenCalled();
      });

      it('sends can_link_account then continues through handleNavigation for a Firefox non-Sync (Relay) signin flow that does not need keys', async () => {
        mockEnsureCanLinkAcountOrRedirect = jest.fn().mockResolvedValue(true);

        const integration = createMockSigninOAuthNativeIntegration({
          service: OAuthNativeServices.Relay,
          isSync: false,
        });
        // Relay doesn't request keys, so no set_password detour — it flows
        // through handleNavigation.
        integration.wantsKeysIfPasswordEntered = jest
          .fn()
          .mockReturnValue(false);

        render({ integration, isSignup: false });
        await submitCode();

        await waitFor(() => {
          expect(mockEnsureCanLinkAcountOrRedirect).toHaveBeenCalledWith(
            expect.objectContaining({
              email: MOCK_EMAIL,
              uid: MOCK_UID,
              navigateWithQuery: mockNavigateWithQuery,
            })
          );
        });
        await waitFor(() => {
          expect(mockHandleNavigation).toHaveBeenCalled();
        });
      });

      // "keys not optional" = Firefox where Sync isn't decoupled: desktop
      // before 147, and Mobile as of Firefox 153.
      it('redirects to set password for a non-Sync VPN signin that needs keys when keys are not optional', async () => {
        mockEnsureCanLinkAcountOrRedirect = jest.fn().mockResolvedValue(true);

        const integration = createMockSigninOAuthNativeIntegration({
          service: OAuthNativeServices.Vpn,
          isSync: false,
        });

        render({
          integration,
          isSignup: false,
          browserSupportsKeysOptional: false,
        });
        await submitCode();

        await waitFor(() => {
          expect(mockNavigateWithQuery).toHaveBeenCalledWith(
            '/post_verify/set_password',
            expect.objectContaining({
              replace: true,
              state: { passwordCreationReason: 'otp' },
            })
          );
        });
        // Web channel messages must be deferred — handleNavigation only runs
        // after the password is created.
        expect(mockHandleNavigation).not.toHaveBeenCalled();
      });

      it('continues through handleNavigation for a non-Sync VPN signin when the browser supports keys-optional login', async () => {
        mockEnsureCanLinkAcountOrRedirect = jest.fn().mockResolvedValue(true);

        const integration = createMockSigninOAuthNativeIntegration({
          service: OAuthNativeServices.Vpn,
          isSync: false,
        });

        render({
          integration,
          isSignup: false,
          browserSupportsKeysOptional: true,
        });
        await submitCode();

        await waitFor(() => {
          expect(mockHandleNavigation).toHaveBeenCalled();
        });
        expect(mockNavigateWithQuery).not.toHaveBeenCalledWith(
          '/post_verify/set_password',
          expect.anything()
        );
      });

      it('with OAuth integration', async () => {
        const finishOAuthFlowHandler = jest
          .fn()
          .mockReturnValueOnce(MOCK_OAUTH_FLOW_HANDLER_RESPONSE);
        const integration = createMockSigninOAuthIntegration();

        render({ finishOAuthFlowHandler, integration, isSignup: true });
        await submitCode();

        await waitFor(() => {
          expect(hardNavigateSpy).toHaveBeenCalledWith('someUri', {
            newAccountVerification: 'true',
          });
        });
      });

      it('redirects to TOTP setup when integration wantsTwoStepAuthentication', async () => {
        const integration = createMockSigninOAuthIntegration();
        integration.wantsTwoStepAuthentication = jest
          .fn()
          .mockReturnValue(true);

        render({ integration, isSignup: true });
        await submitCode();

        await waitFor(() => {
          expect(mockNavigateWithQuery).toHaveBeenCalledWith(
            '/inline_totp_setup',
            expect.objectContaining({
              state: expect.objectContaining({
                email: MOCK_EMAIL,
                verificationReason: 'signup',
              }),
            })
          );
        });
      });

      it('with web integration and valid redirect', async () => {
        const integration = createMockSigninWebIntegration();
        integration.data.redirectTo = 'https://mozilla.org';

        render({ integration, isSignup: true });
        await submitCode();

        await waitFor(() => {
          expect(hardNavigateSpy).toHaveBeenCalledWith('https://mozilla.org');
        });
      });

      it('navigates to settings when web integration without redirectTo', async () => {
        const integration = createMockSigninWebIntegration();

        render({ integration, isSignup: true });
        await submitCode();

        await waitFor(() => {
          expect(mockNavigateWithQuery).toHaveBeenCalledWith('/settings', {
            replace: true,
          });
        });
      });
    });
  });

  describe('sendError prop', () => {
    it('displays error banner when sendError is provided', async () => {
      const mockError = {
        errno: 999,
        message: 'Network error',
      };

      render({ sendError: mockError });

      // The error banner should be visible with the "Unexpected error" message
      await screen.findByText(/Unexpected error/);
    });

    it('does not display error banner when sendError is null', () => {
      render({ sendError: null });

      // Should not have an error banner with "Unexpected error"
      expect(screen.queryByText(/Unexpected error/)).not.toBeInTheDocument();
    });

    it('clears sendError banner when resend code is clicked', async () => {
      const mockError = {
        errno: 999,
        message: 'Network error',
      };

      render({ sendError: mockError });

      // Error banner should be visible initially
      await screen.findByText(/Unexpected error/);

      // Click resend code button
      const resendButton = screen.getByRole('button', {
        name: 'Email new code.',
      });
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(mockAuthClient.passwordlessResendCode).toHaveBeenCalled();
      });

      // Error banner should be cleared after clicking resend
      await waitFor(() => {
        expect(screen.queryByText(/Unexpected error/)).not.toBeInTheDocument();
      });
    });

    it('displays throttled error from sendError', async () => {
      const throttledError = {
        errno: AuthUiErrors.THROTTLED.errno!,
        message: 'Throttled',
      };

      render({ sendError: throttledError });

      await screen.findByText(/tried too many times/);
    });

    it('shows resend success banner even if sendError was initially present', async () => {
      const mockError = {
        errno: 999,
        message: 'Network error',
      };

      render({ sendError: mockError });

      // Click resend code button
      const resendButton = screen.getByRole('button', {
        name: 'Email new code.',
      });
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(mockAuthClient.passwordlessResendCode).toHaveBeenCalled();
      });

      // Success banner should appear
      await screen.findByText(/A new code was sent to your email./);
    });

    it('clears sendError banner when code is submitted', async () => {
      const mockError = {
        errno: 999,
        message: 'Network error',
      };

      render({ sendError: mockError });

      // Error banner should be visible initially
      await screen.findByText(/Unexpected error/);

      // Submit a code
      const user = userEvent.setup();
      const input = screen.getByLabelText('Enter 6-digit code');
      await user.type(input, MOCK_PASSWORDLESS_CODE);
      const button = screen.getByRole('button', { name: 'Confirm' });
      await user.click(button);

      await waitFor(() => {
        expect(mockAuthClient.passwordlessConfirmCode).toHaveBeenCalled();
      });

      // Error banner should be cleared after submission
      await waitFor(() => {
        expect(screen.queryByText(/Unexpected error/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Glean metrics', () => {
    async function submitCode(code = MOCK_PASSWORDLESS_CODE) {
      const user = userEvent.setup();
      const input = screen.getByLabelText('Enter 6-digit code');
      await user.type(input, code);
      const button = screen.getByRole('button', { name: 'Confirm' });
      await user.click(button);
    }

    it('emits login view event on mount for signin flow', () => {
      render({ isSignup: false });
      expect(mockGleanPasswordlessLogin.view).toHaveBeenCalledTimes(1);
      expect(mockGleanPasswordlessReg.view).not.toHaveBeenCalled();
    });

    it('emits reg view event on mount for signup flow', () => {
      render({ isSignup: true });
      expect(mockGleanPasswordlessReg.view).toHaveBeenCalledTimes(1);
      expect(mockGleanPasswordlessLogin.view).not.toHaveBeenCalled();
    });

    it('does not emit engage on mount', () => {
      render({ isSignup: false });
      expect(mockGleanPasswordlessLogin.engage).not.toHaveBeenCalled();
    });

    it('emits engage event on first keystroke', async () => {
      render({ isSignup: false });
      const user = userEvent.setup();
      const input = screen.getByLabelText('Enter 6-digit code');
      await user.type(input, '1');
      expect(mockGleanPasswordlessLogin.engage).toHaveBeenCalledTimes(1);

      // Subsequent keystrokes should not re-emit
      await user.type(input, '2');
      expect(mockGleanPasswordlessLogin.engage).toHaveBeenCalledTimes(1);
    });

    it('emits submit and submitSuccess on successful code submission', async () => {
      render({ isSignup: false });
      await submitCode();

      await waitFor(() => {
        expect(mockGleanPasswordlessLogin.submit).toHaveBeenCalledTimes(1);
        expect(mockGleanPasswordlessLogin.submitSuccess).toHaveBeenCalledTimes(
          1
        );
      });
    });

    it('emits submit and error on throttled code submission', async () => {
      mockAuthClient.passwordlessConfirmCode = jest
        .fn()
        .mockRejectedValue(AuthUiErrors.THROTTLED);

      render({ isSignup: false });
      await submitCode();

      await waitFor(() => {
        expect(mockGleanPasswordlessLogin.submit).toHaveBeenCalledTimes(1);
        expect(mockGleanPasswordlessLogin.error).toHaveBeenCalledWith({
          event: { reason: 'too many times' },
        });
      });
    });

    it('emits submit and error on invalid code submission', async () => {
      mockAuthClient.passwordlessConfirmCode = jest
        .fn()
        .mockRejectedValue(AuthUiErrors.INVALID_VERIFICATION_CODE);

      render({ isSignup: false });
      await submitCode();

      await waitFor(() => {
        expect(mockGleanPasswordlessLogin.submit).toHaveBeenCalledTimes(1);
        expect(mockGleanPasswordlessLogin.error).toHaveBeenCalledWith({
          event: { reason: 'invalid' },
        });
      });
    });

    it('emits resendCode event on resend click', async () => {
      render({ isSignup: false });
      const resendButton = screen.getByRole('button', {
        name: 'Email new code.',
      });
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(mockGleanPasswordlessLogin.resendCode).toHaveBeenCalledTimes(1);
      });
    });

    it('emits error event on throttled resend', async () => {
      mockAuthClient.passwordlessResendCode = jest
        .fn()
        .mockRejectedValue(AuthUiErrors.THROTTLED);

      render({ isSignup: false });
      const resendButton = screen.getByRole('button', {
        name: 'Email new code.',
      });
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(mockGleanPasswordlessLogin.resendCode).toHaveBeenCalledTimes(1);
        expect(mockGleanPasswordlessLogin.error).toHaveBeenCalledWith({
          event: { reason: 'too many times' },
        });
      });
    });

    it('emits changeEmail event on "Use a different account" click for signin', () => {
      render({ isSignup: false });
      const link = screen.getByText('Use a different account');
      fireEvent.click(link);
      expect(mockGleanPasswordlessLogin.changeEmail).toHaveBeenCalledTimes(1);
      expect(mockGleanPasswordlessReg.changeEmail).not.toHaveBeenCalled();
    });

    it('emits changeEmail event on "Use a different account" click for signup', () => {
      render({ isSignup: true });
      const link = screen.getByText('Use a different account');
      fireEvent.click(link);
      expect(mockGleanPasswordlessReg.changeEmail).toHaveBeenCalledTimes(1);
      expect(mockGleanPasswordlessLogin.changeEmail).not.toHaveBeenCalled();
    });

    it('uses reg metrics for signup flow on submit', async () => {
      render({ isSignup: true });
      await submitCode();

      await waitFor(() => {
        expect(mockGleanPasswordlessReg.submit).toHaveBeenCalledTimes(1);
        expect(mockGleanPasswordlessReg.submitSuccess).toHaveBeenCalledTimes(1);
        expect(mockGleanPasswordlessLogin.submit).not.toHaveBeenCalled();
      });
    });
  });
});
