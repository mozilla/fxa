/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import SigninUnblock, { viewName } from '.';
import { usePageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';
import { LocationProvider } from '@reach/router';
import { MOCK_EMAIL } from '../../mocks';
import {
  createBeginSigninResponse,
  createBeginSigninResponseError,
} from '../mocks';
import GleanMetrics from '../../../lib/glean';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';

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

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

const email = MOCK_EMAIL;
const hasLinkedAccount = false;
const hasPassword = true;
let signinWithUnblockCode = jest.fn();
let resendUnblockCodeHandler = jest.fn();

const renderWithSuccess = () => {
  signinWithUnblockCode = jest
    .fn()
    .mockReturnValue(createBeginSigninResponse());
  resendUnblockCodeHandler = jest.fn().mockReturnValue({ success: true });

  renderWithLocalizationProvider(
    <LocationProvider>
      <SigninUnblock
        {...{
          email,
          hasLinkedAccount,
          hasPassword,
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

  renderWithLocalizationProvider(
    <LocationProvider>
      <SigninUnblock
        {...{
          email,
          hasLinkedAccount,
          hasPassword,
          signinWithUnblockCode,
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
    screen.getByRole('img', { name: 'An envelope containing a link' });
    screen.getByRole('textbox', { name: 'Enter authorization code' });
    screen.getByRole('button', { name: 'Continue' });
    screen.getByRole('button', {
      name: 'Not in inbox or spam folder? Resend',
    });
    screen.getByRole('link', { name: /Why is this happening/ });
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
          'Authorization can only contain letters and/or numbers'
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
      expect(mockNavigate).toHaveBeenCalledWith('/signin', {
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
      expect(mockNavigate).not.toHaveBeenCalled();
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
      expect(mockNavigate).toHaveBeenCalled();
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
        expect(screen.getByText(/Email resent/)).toBeInTheDocument();
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
