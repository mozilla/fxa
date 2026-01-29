/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import SigninRecoveryCode from '.';
import GleanMetrics from '../../../lib/glean';
import {
  createMockSigninOAuthIntegration,
  createMockSigninOAuthNativeSyncIntegration,
  createMockSigninWebIntegration,
  mockSigninLocationState,
} from '../mocks';
import { LocationProvider } from '@reach/router';
import {
  MOCK_BACKUP_CODE,
  MOCK_CMS_INFO,
  MOCK_OAUTH_FLOW_HANDLER_RESPONSE,
} from '../../mocks';
import * as SigninUtils from '../utils';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { OAUTH_ERRORS } from '../../../lib/oauth';
import { tryAgainError } from '../../../lib/oauth/hooks';

const mockNavigateWithQuery = jest.fn();
jest.mock('../../../lib/hooks/useNavigateWithQuery', () => ({
  useNavigateWithQuery: () => mockNavigateWithQuery,
}));

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
const mockIntegration = createMockSigninWebIntegration({ cmsInfo: undefined });

describe('PageSigninRecoveryCode', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockNavigateWithQuery.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders as expected', () => {
    const mockSubmitRecoveryCode = jest.fn();
    renderWithLocalizationProvider(
      <LocationProvider>
        <SigninRecoveryCode
          finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
          integration={mockIntegration}
          navigateToRecoveryPhone={jest.fn()}
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
      'Enter one of the one-time-use codes you saved when you set up two-step authentication.'
    );
    screen.getByRole('textbox', {
      name: 'Enter 10-character code',
    });

    screen.getByRole('button', { name: 'Confirm' });
    screen.getByRole('button', { name: 'Back' });
    screen.getByRole('link', {
      name: /Are you locked out/i,
    });
  });

  it('has expected glean click events', async () => {
    const mockSubmitRecoveryCode = jest.fn();
    renderWithLocalizationProvider(
      <LocationProvider>
        <SigninRecoveryCode
          finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
          integration={mockIntegration}
          navigateToRecoveryPhone={jest.fn()}
          signinState={mockSigninLocationState}
          submitRecoveryCode={mockSubmitRecoveryCode}
          lastFourPhoneDigits="1234"
        />
      </LocationProvider>
    );

    const user = userEvent.setup();
    await waitFor(() =>
      user.type(screen.getByRole('textbox'), MOCK_BACKUP_CODE)
    );

    expect(screen.getByRole('button', { name: /Confirm/i })).toHaveAttribute(
      'data-glean-id',
      'login_backup_codes_submit'
    );

    const phoneLink = screen.getByRole('button', {
      name: /Use recovery phone/i,
    });
    expect(phoneLink).toHaveAttribute(
      'data-glean-id',
      'login_backup_codes_phone_instead'
    );

    const lockedOutLink = screen.getByRole('link', {
      name: /Are you locked out/i,
    });
    expect(lockedOutLink).toHaveAttribute(
      'data-glean-id',
      'login_backup_codes_locked_out_link'
    );
  });

  it('renders additional accessibility info from CMS', () => {
    const mockIntegrationWithCms = createMockSigninWebIntegration({
      cmsInfo: MOCK_CMS_INFO,
    });
    renderWithLocalizationProvider(
      <LocationProvider>
        <SigninRecoveryCode
          finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
          integration={mockIntegrationWithCms}
          navigateToRecoveryPhone={jest.fn()}
          signinState={mockSigninLocationState}
          submitRecoveryCode={jest.fn()}
        />
      </LocationProvider>
    );

    const additionalInfo = screen.getByText(
      MOCK_CMS_INFO.shared.additionalAccessibilityInfo
    );

    expect(additionalInfo).toBeInTheDocument();
  });

  describe('metrics', () => {
    it('emits a metrics event on render', () => {
      const mockSubmitRecoveryCode = jest.fn();
      renderWithLocalizationProvider(
        <LocationProvider>
          <SigninRecoveryCode
            finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
            integration={mockIntegration}
            navigateToRecoveryPhone={jest.fn()}
            signinState={mockSigninLocationState}
            submitRecoveryCode={mockSubmitRecoveryCode}
          />
        </LocationProvider>
      );
      expect(GleanMetrics.loginBackupCode.view).toHaveBeenCalledTimes(1);
    });

    it('emits metrics events on submit and success', async () => {
      const user = userEvent.setup();
      const mockSubmitRecoveryCode = jest
        .fn()
        .mockResolvedValue({ data: { consumeRecoveryCode: { remaining: 3 } } });
      renderWithLocalizationProvider(
        <LocationProvider>
          <SigninRecoveryCode
            finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
            integration={mockIntegration}
            navigateToRecoveryPhone={jest.fn()}
            signinState={mockSigninLocationState}
            submitRecoveryCode={mockSubmitRecoveryCode}
          />
        </LocationProvider>
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: 'Confirm' });
      await user.type(input, MOCK_BACKUP_CODE);
      expect(button).toBeEnabled();
      await user.click(button);

      await waitFor(() => {
        expect(mockSubmitRecoveryCode).toHaveBeenCalled();
        expect(GleanMetrics.loginBackupCode.submit).toHaveBeenCalledTimes(1);
        expect(GleanMetrics.loginBackupCode.success).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('submit with success', () => {
    it('does not navigate when integration isFirefoxMobileClient', async () => {
      const user = userEvent.setup();
      const handleNavigationSpy = jest.spyOn(SigninUtils, 'handleNavigation');
      const mockFinishOAuthFlowHandler = jest
        .fn()
        .mockReturnValue(MOCK_OAUTH_FLOW_HANDLER_RESPONSE);
      const mockSubmitRecoveryCode = jest
        .fn()
        .mockResolvedValue({ data: { consumeRecoveryCode: { remaining: 3 } } });
      const integration = createMockSigninOAuthNativeSyncIntegration({
        isMobile: true,
      });
      renderWithLocalizationProvider(
        <LocationProvider>
          <SigninRecoveryCode
            finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
            integration={integration}
            navigateToRecoveryPhone={jest.fn()}
            signinState={mockSigninLocationState}
            submitRecoveryCode={mockSubmitRecoveryCode}
          />
        </LocationProvider>
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: 'Confirm' });
      await user.type(input, MOCK_BACKUP_CODE);
      expect(button).toBeEnabled();
      await user.click(button);

      expect(integration.isFirefoxMobileClient()).toBe(true);
      await waitFor(() => {
        expect(handleNavigationSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            performNavigation: false,
          })
        );
      });
    });

    it('passes isSessionAALUpgrade as a navigation option to handleNavigation', async () => {
      const user = userEvent.setup();
      const handleNavigationSpy = jest.spyOn(SigninUtils, 'handleNavigation');
      const mockSubmitRecoveryCode = jest
        .fn()
        .mockResolvedValue({ data: { consumeRecoveryCode: { remaining: 3 } } });

      renderWithLocalizationProvider(
        <LocationProvider>
          <SigninRecoveryCode
            finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
            integration={createMockSigninWebIntegration()}
            navigateToRecoveryPhone={jest.fn()}
            signinState={{
              ...mockSigninLocationState,
              isSessionAALUpgrade: true,
            }}
            submitRecoveryCode={mockSubmitRecoveryCode}
          />
        </LocationProvider>
      );
      await user.type(screen.getByRole('textbox'), MOCK_BACKUP_CODE);
      await user.click(screen.getByRole('button', { name: 'Confirm' }));

      await waitFor(() => {
        expect(handleNavigationSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            isSessionAALUpgrade: true,
          })
        );
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
            navigateToRecoveryPhone={jest.fn()}
            signinState={mockSigninLocationState}
            submitRecoveryCode={mockSubmitRecoveryCode}
          />
        </LocationProvider>
      );
      const button = screen.getByRole('button', { name: 'Confirm' });
      expect(button).toBeDisabled();

      // Button should be disabled, so clicking it should not trigger submission
      button.click();
      expect(mockSubmitRecoveryCode).not.toHaveBeenCalled();
    });
    it('shows an error tooltip when invalid code error response on submit', async () => {
      const user = userEvent.setup();
      const mockSubmitRecoveryCodeWithError = jest.fn().mockResolvedValueOnce({
        error: { errno: AuthUiErrors.INVALID_RECOVERY_CODE.errno },
      });
      renderWithLocalizationProvider(
        <LocationProvider>
          <SigninRecoveryCode
            finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
            integration={mockIntegration}
            navigateToRecoveryPhone={jest.fn()}
            signinState={mockSigninLocationState}
            submitRecoveryCode={mockSubmitRecoveryCodeWithError}
          />
        </LocationProvider>
      );
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: 'Confirm' });
      await user.type(input, MOCK_BACKUP_CODE);
      expect(button).toBeEnabled();
      await user.click(button);
      await waitFor(() => {
        const tooltip = screen.getByTestId('tooltip');
        expect(tooltip).toHaveTextContent('Invalid backup authentication code');
      });
    });
    it('shows an error banner for an OAuth error', async () => {
      const user = userEvent.setup();
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
            navigateToRecoveryPhone={jest.fn()}
            signinState={mockSigninLocationState}
            submitRecoveryCode={mockSubmitRecoveryCode}
          />
        </LocationProvider>
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: 'Confirm' });
      await user.type(input, MOCK_BACKUP_CODE);
      expect(button).toBeEnabled();
      await user.click(button);

      await waitFor(() => {
        screen.getByText(OAUTH_ERRORS.TRY_AGAIN.message);
      });
    });
    it('shows an error banner for other errors on submit', async () => {
      const user = userEvent.setup();
      const mockSubmitRecoveryCodeWithError = jest.fn().mockResolvedValueOnce({
        // error response, but not invalid code
        error: {},
      });
      renderWithLocalizationProvider(
        <LocationProvider>
          <SigninRecoveryCode
            finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
            integration={mockIntegration}
            navigateToRecoveryPhone={jest.fn()}
            signinState={mockSigninLocationState}
            submitRecoveryCode={mockSubmitRecoveryCodeWithError}
          />
        </LocationProvider>
      );
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: 'Confirm' });
      await user.type(input, MOCK_BACKUP_CODE);
      expect(button).toBeEnabled();
      await user.click(button);
      await waitFor(() => {
        const tooltip = screen.queryByTestId('tooltip');
        expect(tooltip).not.toBeInTheDocument();
        screen.getByText('Unexpected error');
      });
    });
  });
});
