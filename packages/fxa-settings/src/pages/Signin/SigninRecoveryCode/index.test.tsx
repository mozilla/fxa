/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import SigninRecoveryCode from '.';
import { MozServices } from '../../../lib/types';
import GleanMetrics from '../../../lib/glean';
import {
  createMockSigninOAuthIntegration,
  createMockSigninWebIntegration,
  mockSigninLocationState,
} from '../mocks';
import { LocationProvider } from '@reach/router';
import { MOCK_RECOVERY_CODE } from '../../mocks';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { OAUTH_ERRORS } from '../../../lib/oauth';
import { tryAgainError } from '../../../lib/oauth/hooks';

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    loginBackupCode: {
      view: jest.fn(),
      submit: jest.fn(),
      success: jest.fn(),
    },
  },
}));

const mockFinishOAuthFlowHandler = jest.fn();
const mockIntegration = createMockSigninWebIntegration();

describe('PageSigninRecoveryCode', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders as expected', () => {
    const mockSubmitRecoveryCode = jest.fn();
    renderWithLocalizationProvider(
      <LocationProvider>
        <SigninRecoveryCode
          finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
          integration={mockIntegration}
          signinState={mockSigninLocationState}
          submitRecoveryCode={mockSubmitRecoveryCode}
        />
      </LocationProvider>
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Sign in'
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Enter backup authentication code'
    );
    screen.getByRole('img', { name: 'Document that contains hidden text.' });
    screen.getByText(
      'Enter one of the one-time use backup authentication codes you saved during two-step authentication setup.'
    );
    screen.getByRole('textbox', {
      name: 'Enter 10-character code',
    });

    screen.getByRole('button', { name: 'Confirm' });
    screen.getByRole('link', { name: 'Back' });
    screen.getByRole('link', {
      name: /Are you locked out?/,
    });
  });

  describe('metrics', () => {
    it('emits a metrics event on render', () => {
      const mockSubmitRecoveryCode = jest.fn();
      renderWithLocalizationProvider(
        <LocationProvider>
          <SigninRecoveryCode
            finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
            integration={mockIntegration}
            signinState={mockSigninLocationState}
            submitRecoveryCode={mockSubmitRecoveryCode}
          />
        </LocationProvider>
      );
      expect(GleanMetrics.loginBackupCode.view).toBeCalledTimes(1);
    });

    it('emits metrics events on submit and success', async () => {
      const mockSubmitRecoveryCode = jest
        .fn()
        .mockResolvedValue({ data: { consumeRecoveryCode: { remaining: 3 } } });
      renderWithLocalizationProvider(
        <LocationProvider>
          <SigninRecoveryCode
            finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
            integration={mockIntegration}
            signinState={mockSigninLocationState}
            submitRecoveryCode={mockSubmitRecoveryCode}
          />
        </LocationProvider>
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: 'Confirm' });
      fireEvent.change(input, { target: { value: MOCK_RECOVERY_CODE } });
      await waitFor(() => {
        expect(input).toHaveValue(MOCK_RECOVERY_CODE);
      });
      button.click();

      await waitFor(() => {
        expect(mockSubmitRecoveryCode).toHaveBeenCalled();
        expect(GleanMetrics.loginBackupCode.submit).toBeCalledTimes(1);
        expect(GleanMetrics.loginBackupCode.success).toBeCalledTimes(1);
      });
    });
  });

  describe('submit with error', () => {
    it('shows an error tooltip when submit without code', async () => {
      const mockSubmitRecoveryCode = jest.fn();
      renderWithLocalizationProvider(
        <LocationProvider>
          <SigninRecoveryCode
            finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
            integration={mockIntegration}
            signinState={mockSigninLocationState}
            submitRecoveryCode={mockSubmitRecoveryCode}
          />
        </LocationProvider>
      );
      const button = screen.getByRole('button', { name: 'Confirm' });
      button.click();
      await waitFor(() => {
        const tooltip = screen.getByTestId('tooltip');
        expect(tooltip).toHaveTextContent(
          'Backup authentication code required'
        );
      });
    });
    it('shows an error tooltip when invalid code error response on submit', async () => {
      const mockSubmitRecoveryCodeWithError = jest.fn().mockResolvedValueOnce({
        error: { errno: AuthUiErrors.INVALID_RECOVERY_CODE.errno },
      });
      renderWithLocalizationProvider(
        <LocationProvider>
          <SigninRecoveryCode
            finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
            integration={mockIntegration}
            signinState={mockSigninLocationState}
            submitRecoveryCode={mockSubmitRecoveryCodeWithError}
          />
        </LocationProvider>
      );
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: 'Confirm' });
      fireEvent.change(input, { target: { value: MOCK_RECOVERY_CODE } });
      await waitFor(() => {
        expect(input).toHaveValue(MOCK_RECOVERY_CODE);
      });
      button.click();
      await waitFor(() => {
        const tooltip = screen.getByTestId('tooltip');
        expect(tooltip).toHaveTextContent('Invalid backup authentication code');
      });
    });
    it('shows an error banner for an OAuth error', async () => {
      const mockSubmitRecoveryCode = jest
        .fn()
        .mockResolvedValue({ data: { consumeRecoveryCode: { remaining: 3 } } });
      renderWithLocalizationProvider(
        <LocationProvider>
          <SigninRecoveryCode
            finishOAuthFlowHandler={jest
              .fn()
              .mockReturnValueOnce(tryAgainError())}
            integration={createMockSigninOAuthIntegration()}
            signinState={mockSigninLocationState}
            submitRecoveryCode={mockSubmitRecoveryCode}
          />
        </LocationProvider>
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: 'Confirm' });
      fireEvent.change(input, { target: { value: MOCK_RECOVERY_CODE } });
      // await waitFor(() => {
      expect(input).toHaveValue(MOCK_RECOVERY_CODE);
      // });
      button.click();

      await waitFor(() => {
        screen.getByText(OAUTH_ERRORS.TRY_AGAIN.message);
      });
    });
    it('shows an error banner for other errors on submit', async () => {
      const mockSubmitRecoveryCodeWithError = jest.fn().mockResolvedValueOnce({
        // error response, but not invalid code
        error: {},
      });
      renderWithLocalizationProvider(
        <LocationProvider>
          <SigninRecoveryCode
            finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
            integration={mockIntegration}
            signinState={mockSigninLocationState}
            submitRecoveryCode={mockSubmitRecoveryCodeWithError}
          />
        </LocationProvider>
      );
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: 'Confirm' });
      fireEvent.change(input, { target: { value: MOCK_RECOVERY_CODE } });
      await waitFor(() => {
        expect(input).toHaveValue(MOCK_RECOVERY_CODE);
      });
      button.click();
      await waitFor(() => {
        const tooltip = screen.queryByTestId('tooltip');
        expect(tooltip).not.toBeInTheDocument();
        screen.getByText('Unexpected error');
      });
    });
  });
});
