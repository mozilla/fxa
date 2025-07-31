/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import * as utils from 'fxa-react/lib/utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import SigninUnblock, { viewName } from '.';
import { usePageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';
import { LocationProvider } from '@reach/router';
import { MOCK_EMAIL, mockFinishOAuthFlowHandler } from '../../mocks';
import {
  createBeginSigninResponse,
  createBeginSigninResponseError,
  createMockSigninOAuthIntegration,
  createMockSigninOAuthNativeSyncIntegration,
  createMockSigninWebIntegration,
} from '../mocks';
import GleanMetrics from '../../../lib/glean';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { navigate } from '@reach/router';
import { tryAgainError } from '../../../lib/oauth/hooks';
import { OAUTH_ERRORS } from '../../../lib/oauth';
import { createMockWebIntegration } from './mocks';
import * as SigninUtils from '../utils';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    login: {
      submit: jest.fn(),
      success: jest.fn(),
    },
  },
}));

const mockUseNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockUseNavigate,
  navigate: jest.fn(),
}));

const email = MOCK_EMAIL;
const hasLinkedAccount = false;
const hasPassword = true;
let signinWithUnblockCode = jest.fn();
let resendUnblockCodeHandler = jest.fn();

const serviceRelayText =
  'Firefox will try sending you back to use an email mask after you sign in.';

const renderWithSuccess = (
  finishOAuthFlowHandler = jest
    .fn()
    .mockReturnValueOnce(mockFinishOAuthFlowHandler),
  integration = createMockSigninWebIntegration(),
  signinResponse = createBeginSigninResponse()
) => {
  signinWithUnblockCode = jest.fn().mockReturnValue(signinResponse);
  resendUnblockCodeHandler = jest.fn().mockReturnValue({ success: true });

  renderWithLocalizationProvider(
    <LocationProvider>
      <SigninUnblock
        {...{
          email,
          hasLinkedAccount,
          hasPassword,
          integration,
          finishOAuthFlowHandler,
          signinWithUnblockCode,
          resendUnblockCodeHandler,
        }}
      />
    </LocationProvider>
  );
};

const renderWithError = (errno = AuthUiErrors.UNEXPECTED_ERROR.errno) => {
  signinWithUnblockCode = jest
    .fn()
    .mockReturnValue(createBeginSigninResponseError({ errno }));
  resendUnblockCodeHandler = jest.fn().mockReturnValue({
    success: false,
    localizedErrorMessage: 'Something went wrong',
  });
  const integration = createMockSigninWebIntegration();

  renderWithLocalizationProvider(
    <LocationProvider>
      <SigninUnblock
        {...{
          email,
          hasLinkedAccount,
          hasPassword,
          signinWithUnblockCode,
          integration,
          finishOAuthFlowHandler: mockFinishOAuthFlowHandler,
          resendUnblockCodeHandler,
        }}
      />
    </LocationProvider>
  );
};

afterEach(() => {
  jest.resetAllMocks();
});

describe('SigninUnblock', () => {
  it('renders as expected', () => {
    renderWithSuccess();

    screen.getByRole('heading', { name: 'Authorize this sign-in' });
    screen.getByRole('img', {
      name: 'Illustration to represent an email containing a code.',
    });
    screen.getByRole('textbox', { name: 'Enter authorization code' });
    screen.getByRole('button', { name: 'Continue' });
    screen.getByRole('button', {
      name: 'Not in inbox or spam folder? Resend',
    });
    screen.getByRole('link', { name: /Why is this happening/ });
    expect(screen.queryByText(serviceRelayText)).not.toBeInTheDocument();
  });

  it('renders expected text when service=relay', () => {
    renderWithSuccess(
      undefined,
      createMockSigninOAuthNativeSyncIntegration({
        isSync: false,
      })
    );
    screen.getByText(serviceRelayText);
  });

  it('emits the expected metrics on render', () => {
    renderWithSuccess();
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  describe('handles errors as expected', () => {
    it('with an empty code field', async () => {
      renderWithSuccess();
      const submitButton = screen.getByRole('button', { name: 'Continue' });
      submitButton.click();
      await waitFor(() => {
        expect(screen.getByTestId('tooltip')).toHaveTextContent(
          'Authorization code required'
        );
      });
      expect(GleanMetrics.login.submit).not.toHaveBeenCalled();
      expect(signinWithUnblockCode).not.toHaveBeenCalled();
    });

    it('with incorrect code length', async () => {
      renderWithSuccess();
      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: 'Continue' });

      fireEvent.change(input, { target: { value: 'boop' } });
      submitButton.click();
      await waitFor(() => {
        expect(screen.getByTestId('tooltip')).toHaveTextContent(
          'Authorization code must contain 8 characters'
        );
      });
      expect(GleanMetrics.login.submit).not.toHaveBeenCalled();
      expect(signinWithUnblockCode).not.toHaveBeenCalled();
    });

    it('with incorrect code format', async () => {
      renderWithSuccess();
      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: 'Continue' });

      fireEvent.change(input, { target: { value: '@#$%abcd' } });
      submitButton.click();
      await waitFor(() => {
        expect(screen.getByTestId('tooltip')).toHaveTextContent(
          'Authorization code can only contain letters and/or numbers'
        );
      });
      expect(GleanMetrics.login.submit).not.toHaveBeenCalled();
      expect(signinWithUnblockCode).not.toHaveBeenCalled();
    });

    it('with incorrect password', async () => {
      renderWithError(AuthUiErrors.INCORRECT_PASSWORD.errno);
      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: 'Continue' });

      fireEvent.change(input, { target: { value: 'A1B2C3D4' } });
      submitButton.click();
      await waitFor(() => {
        expect(signinWithUnblockCode).toHaveBeenCalledTimes(1);
      });
      expect(GleanMetrics.login.submit).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.login.success).not.toHaveBeenCalled();
      expect(mockUseNavigate).toHaveBeenCalledWith('/signin', {
        state: {
          email: MOCK_EMAIL,
          hasLinkedAccount: false,
          hasPassword: true,
          localizedErrorMessage: 'Incorrect password',
        },
      });
    });

    it('with invalid unblock code', async () => {
      renderWithError(AuthUiErrors.INVALID_UNBLOCK_CODE.errno);
      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: 'Continue' });

      fireEvent.change(input, { target: { value: 'A1B2C3D4' } });
      submitButton.click();
      await waitFor(() => {
        expect(signinWithUnblockCode).toHaveBeenCalledTimes(1);
      });
      expect(GleanMetrics.login.submit).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.login.success).not.toHaveBeenCalled();
      expect(mockUseNavigate).not.toHaveBeenCalled();
      expect(screen.getByTestId('tooltip')).toHaveTextContent(
        'Invalid authorization code'
      );
    });
  });

  describe('submit', () => {
    it('is successful with valid code', async () => {
      renderWithSuccess();
      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: 'Continue' });

      fireEvent.change(input, { target: { value: 'A1B2C3D4' } });
      submitButton.click();
      await waitFor(() => {
        expect(signinWithUnblockCode).toHaveBeenCalledTimes(1);
      });
      expect(navigate).toHaveBeenCalledWith('/settings', { replace: false });
    });

    it('emits expected metrics events', async () => {
      renderWithSuccess();
      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: 'Continue' });

      fireEvent.change(input, { target: { value: 'A1B2C3D4' } });
      submitButton.click();
      await waitFor(() => {
        expect(GleanMetrics.login.submit).toHaveBeenCalledTimes(1);
        expect(GleanMetrics.login.success).toHaveBeenCalledTimes(1);
      });
    });

    it('shows an error banner for an OAuth error', async () => {
      const finishOAuthFlowHandler = jest
        .fn()
        .mockReturnValueOnce(tryAgainError());
      renderWithSuccess(
        finishOAuthFlowHandler,
        createMockSigninOAuthIntegration()
      );
      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: 'Continue' });

      fireEvent.change(input, { target: { value: 'A1B2C3D4' } });
      submitButton.click();

      await waitFor(() => {
        screen.getByText(OAUTH_ERRORS.TRY_AGAIN.message);
      });
    });
  });

  describe('submit with web integration', () => {
    let hardNavigateSpy: jest.SpyInstance;
    beforeEach(() => {
      hardNavigateSpy = jest
        .spyOn(utils, 'hardNavigate')
        .mockImplementation(() => {});
    });

    afterEach(() => {
      hardNavigateSpy.mockRestore();
    });

    it('with valid redirectTo', async () => {
      const redirectTo = 'http://localhost/';
      const integration = createMockWebIntegration({ redirectTo });
      renderWithSuccess(undefined, integration);
      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: 'Continue' });

      fireEvent.change(input, { target: { value: 'A1B2C3D4' } });
      submitButton.click();

      await waitFor(() => {
        expect(hardNavigateSpy).toHaveBeenCalledWith(
          redirectTo,
          undefined,
          undefined,
          false
        );
      });
    });

    it('with invalid redirectTo', async () => {
      const redirectTo = 'http://invalidhost/';
      const integration = createMockWebIntegration({
        redirectTo,
      });
      renderWithSuccess(undefined, integration);
      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: 'Continue' });

      fireEvent.change(input, { target: { value: 'A1B2C3D4' } });
      submitButton.click();

      await waitFor(() => {
        expect(navigate).toHaveBeenCalledWith('/settings', { replace: false });
      });
    });

    it('without redirectTo', async () => {
      renderWithSuccess();
      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: 'Continue' });

      fireEvent.change(input, { target: { value: 'A1B2C3D4' } });
      submitButton.click();

      await waitFor(() => {
        expect(navigate).toHaveBeenCalledWith('/settings', { replace: false });
      });
    });
  });

  describe('submit with OAuth integration', () => {
    it('does not navigate if integration isFirefoxMobileClient and the sign-in is verified', async () => {
      const handleNavigationSpy = jest.spyOn(SigninUtils, 'handleNavigation');
      const finishOAuthFlowHandler = jest
        .fn()
        .mockImplementation(mockFinishOAuthFlowHandler);
      const integration = createMockSigninOAuthNativeSyncIntegration({
        isMobile: true,
      });
      renderWithSuccess(
        finishOAuthFlowHandler,
        integration,
        createBeginSigninResponse({ verified: true })
      );
      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: 'Continue' });

      fireEvent.change(input, { target: { value: 'A1B2C3D4' } });
      submitButton.click();

      await waitFor(() => {
        expect(handleNavigationSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            performNavigation: false,
          })
        );
      });
    });

    it('still navigates if integration isFirefoxMobileClient and the sign-in is not verified', async () => {
      const handleNavigationSpy = jest
        .spyOn(SigninUtils, 'handleNavigation')
        .mockResolvedValue({ error: undefined });
      const finishOAuthFlowHandler = jest
        .fn()
        .mockImplementation(mockFinishOAuthFlowHandler);
      const integration = createMockSigninOAuthNativeSyncIntegration({
        isMobile: true,
      });
      renderWithSuccess(
        finishOAuthFlowHandler,
        integration,
        createBeginSigninResponse({
          verified: false,
        })
      );
      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: 'Continue' });

      fireEvent.change(input, { target: { value: 'A1B2C3D4' } });
      submitButton.click();

      await waitFor(() => {
        expect(handleNavigationSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            performNavigation: true,
          })
        );
      });
    });
  });

  describe('resend unblock code', () => {
    it('shows a success banner when successful', async () => {
      renderWithSuccess();
      const resendButton = screen.getByRole('button', {
        name: 'Not in inbox or spam folder? Resend',
      });
      resendButton.click();
      expect(resendUnblockCodeHandler).toHaveBeenCalled();
      await waitFor(() => {
        expect(
          screen.getByText(/A new code was sent to your email./)
        ).toBeInTheDocument();
      });
    });

    it('shows an error banner when resend fails', async () => {
      renderWithError();
      const resendButton = screen.getByRole('button', {
        name: 'Not in inbox or spam folder? Resend',
      });
      resendButton.click();
      expect(resendUnblockCodeHandler).toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });
  });
});
