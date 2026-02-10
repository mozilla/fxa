/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
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
import { Subject, MOCK_PASSWORDLESS_CODE } from './mocks';
import {
  MOCK_EMAIL,
  MOCK_OAUTH_FLOW_HANDLER_RESPONSE,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
} from '../../mocks';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import {
  createMockSigninOAuthIntegration,
  createMockSigninWebIntegration,
} from '../mocks';
import { SigninOAuthIntegration } from '../interfaces';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

function applyDefaultMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();

  mockReactUtilsModule();
}

let mockNavigate = jest.fn();
let mockNavigateWithQuery = jest.fn();
jest.mock('@reach/router', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@reach/router'),
    navigate: jest.fn(),
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/signin_passwordless_code', search: '' }),
  };
});

jest.mock('../../../lib/hooks/useNavigateWithQuery', () => ({
  useNavigateWithQuery: () => mockNavigateWithQuery,
}));

jest.mock('../../../lib/hooks/useWebRedirect', () => ({
  useWebRedirect: () => ({ isValid: true }),
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
  } = {}
) {
  if (!props.integration) {
    props.integration = createMockSigninWebIntegration() as SigninOAuthIntegration;
  }

  renderWithLocalizationProvider(
    <AppContext.Provider value={mockAppContext({ authClient: mockAuthClient })}>
      <Subject {...props} />
    </AppContext.Provider>
  );
}

function mockReactUtilsModule() {
  jest.spyOn(ReactUtils, 'hardNavigate').mockImplementation(() => { });
}

describe('SigninPasswordlessCode page', () => {
  beforeEach(() => {
    applyDefaultMocks();
    resetMockAuthClient();
    mockNavigate = jest.fn();
    mockNavigateWithQuery = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('renders as expected', () => {
    it('renders signin flow with correct heading and instructions', () => {
      render({ isSignup: false });

      const headingEl = screen.getByRole('heading', { level: 1 });
      expect(headingEl).toHaveTextContent('Enter confirmation code');

      // Check for the instruction text including "Use a different account"
      screen.getByText(
        (_, element) =>
          !!(element?.tagName === 'P' &&
            element?.textContent?.includes(`Enter the code that was sent to ${MOCK_EMAIL}`) &&
            element?.textContent?.includes('Use a different account'))
      );

      screen.getByLabelText('Enter 8-digit code');
      screen.getByRole('button', { name: 'Confirm' });
      screen.getByText('Code expired?');
    });

    it('renders signup flow with correct heading and instructions', () => {
      render({ isSignup: true });

      const headingEl = screen.getByRole('heading', { level: 1 });
      expect(headingEl).toHaveTextContent('Enter confirmation code');

      // Check for signup-specific instruction text including "Use a different account"
      screen.getByText(
        (_, element) =>
          !!(element?.tagName === 'P' &&
            element?.textContent?.includes(`Enter the code that was sent to ${MOCK_EMAIL}`) &&
            element?.textContent?.includes('Use a different account'))
      );
    });

    it('renders "Use a different account" link', () => {
      render({ isSignup: false });
      
      screen.getByRole('link', { name: 'Use a different account' });
    });
  });

  it('emits a metrics event on render', () => {
    render();
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  describe('"Use a different account" link', () => {
    it('clicking navigates to root and removes email from query params', async () => {
      render({ isSignup: false });
      
      const link = screen.getByRole('link', { name: 'Use a different account' });
      fireEvent.click(link);
      
      await waitFor(() => {
        expect(mockNavigateWithQuery).toHaveBeenCalledWith(
          '/?',
          {
            state: { prefillEmail: MOCK_EMAIL },
          }
        );
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
      
      const link = screen.getByRole('link', { name: 'Use a different account' });
      fireEvent.click(link);
      
      await waitFor(() => {
        expect(mockNavigateWithQuery).toHaveBeenCalledWith(
          '/?other=param',
          {
            state: { prefillEmail: MOCK_EMAIL },
          }
        );
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
      const resendButton = screen.getByRole('button', { name: 'Email new code.' });
      fireEvent.click(resendButton);
      await waitFor(() => {
        expect(mockAuthClient.passwordlessResendCode).toHaveBeenCalledWith(MOCK_EMAIL, { clientId: undefined });
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
      const resendButton = screen.getByRole('button', { name: 'Email new code.' });
      fireEvent.click(resendButton);

      await screen.findByText(/tried too many times/);
    });

    it('on other error, renders banner with expected default error message', async () => {
      mockAuthClient.passwordlessResendCode = jest.fn().mockRejectedValue(new Error());

      render();
      const resendButton = screen.getByRole('button', { name: 'Email new code.' });
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
      const button = screen.getByRole('button', { name: 'Confirm' });
      expect(button).toBeEnabled();
      await userEvent.click(button);
    }

    async function submitCode(code = MOCK_PASSWORDLESS_CODE) {
      const user = userEvent.setup();
      const input = screen.getByLabelText('Enter 8-digit code');
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

      it('if input length is less than 8', async () => {
        const user = userEvent.setup();
        const input = screen.getByLabelText('Enter 8-digit code');
        await user.type(input, '1234567');

        const button = screen.getByRole('button', { name: 'Confirm' });
        expect(button).toBeDisabled();

        fireEvent.click(button);
        expect(mockAuthClient.passwordlessConfirmCode).not.toHaveBeenCalled();
      });

      it('if input is not numeric', async () => {
        const user = userEvent.setup();
        const input = screen.getByLabelText('Enter 8-digit code');
        await user.type(input, '1234567a');

        const button = screen.getByRole('button', { name: 'Confirm' });
        expect(button).toBeDisabled();

        fireEvent.click(button);
        expect(mockAuthClient.passwordlessConfirmCode).not.toHaveBeenCalled();
      });

      it('if input is scientific notation', async () => {
        const user = userEvent.setup();
        const input = screen.getByLabelText('Enter 8-digit code');
        await user.type(input, '1000e100');

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

    it('redirects to password signin if TOTP is required', async () => {
      mockAuthClient.passwordlessConfirmCode = jest
        .fn()
        .mockRejectedValue(AuthUiErrors.TOTP_REQUIRED);

      render();
      await submitCode();

      await waitFor(() => {
        expect(mockNavigateWithQuery).toHaveBeenCalledWith(
          '/signin',
          expect.objectContaining({
            replace: true,
            state: expect.objectContaining({
              email: MOCK_EMAIL,
              skipPasswordlessRedirect: true,
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
          .mockImplementation(() => { });
      });

      afterEach(() => {
        hardNavigateSpy.mockRestore();
      });

      it('redirects to set password page when integration wantsKeys', async () => {
        const integration = createMockSigninWebIntegration();
        integration.wantsKeys = jest.fn().mockReturnValue(true);

        render({ integration });
        await submitCode();

        await waitFor(() => {
          expect(mockNavigateWithQuery).toHaveBeenCalledWith(
            '/post_verify/third_party_auth/set_password',
            expect.objectContaining({
              replace: true,
              state: {
                isPasswordlessFlow: true,
              },
            })
          );
        });
      });

      it('with OAuth integration', async () => {
        const finishOAuthFlowHandler = jest
          .fn()
          .mockReturnValueOnce(MOCK_OAUTH_FLOW_HANDLER_RESPONSE);
        const integration = createMockSigninOAuthIntegration();
        integration.wantsKeys = jest.fn().mockReturnValue(false);

        render({ finishOAuthFlowHandler, integration, isSignup: true });
        await submitCode();

        await waitFor(() => {
          expect(hardNavigateSpy).toHaveBeenCalledWith(
            'someUri',
            { newAccountVerification: 'true' }
          );
        });
      });

      it('redirects to TOTP setup when integration wantsTwoStepAuthentication', async () => {
        const integration = createMockSigninOAuthIntegration();
        integration.wantsKeys = jest.fn().mockReturnValue(false);
        integration.wantsTwoStepAuthentication = jest.fn().mockReturnValue(true);

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
        integration.wantsKeys = jest.fn().mockReturnValue(false);

        render({ integration, isSignup: true });
        await submitCode();

        await waitFor(() => {
          expect(hardNavigateSpy).toHaveBeenCalledWith(
            'https://mozilla.org'
          );
        });
      });

      it('navigates to settings when web integration without redirectTo', async () => {
        const integration = createMockSigninWebIntegration();
        integration.wantsKeys = jest.fn().mockReturnValue(false);

        render({ integration, isSignup: true });
        await submitCode();

        await waitFor(() => {
          expect(mockNavigateWithQuery).toHaveBeenCalledWith(
            '/settings',
            { replace: true }
          );
        });
      });
    });
  });
});